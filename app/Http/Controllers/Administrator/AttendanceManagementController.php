<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\Office;
use App\Services\TardinessConvertion\FixedFlexiTardinessService;
use App\Services\TardinessConvertion\FullFlexiTardinessService;
use App\Models\EmployeeLeave;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class AttendanceManagementController extends Controller
{
    protected $fixedService;
    protected $fullService;

    public function __construct(
        FixedFlexiTardinessService $fixedService,
        FullFlexiTardinessService $fullService
    ) {
        $this->fixedService = $fixedService;
        $this->fullService  = $fullService;
    }

    public function index()
    {
        $user = auth()->user();
        $stationId = optional($user->employee)->station_id;
        $offices = Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->orderBy('name')
            ->get();

        if (!$stationId) {
            abort(403, 'Station not assigned to this user.');
        }

        // ✅ Incomplete Attendances (filtered by station + active employees)
        $incompleteAttendances = Attendance::with(['employee:id,first_name,last_name,work_type,office_id,station_id,active_status',
            'employee.office:id,division_id,name',
            'employee.office.division:id,code,name',
            'am:id,attendance_id,am_time_in,am_time_out',
            'pm:id,attendance_id,pm_time_in,pm_time_out'
        ])
        ->whereHas('employee', function ($q) use ($stationId) {
            $q->where('station_id', $stationId)
            ->where('active_status', 1);
        })
        ->where(function ($q) {
            $q->where(function ($q) {
                $q->whereHas('am', function ($q) {
                    $q->whereNull('am_time_in')
                    ->orWhereNull('am_time_out');
                });
            })
            ->orWhere(function ($q) {
                $q->whereHas('pm', function ($q) {
                    $q->whereNull('pm_time_in')
                    ->orWhereNull('pm_time_out');
                });
            });
        })
        ->get();

        // ✅ Employees (filtered by station + active)
        $employees = Employee::with('office.division:id,code,name')
            ->where('station_id', $stationId)
            ->where('active_status', 1)
            ->select('id', 'first_name', 'last_name', 'work_type', 'office_id', 'active_status')
            ->get();

        // ✅ Employee Leaves (filtered by station + active)
        $employeeLeaves = EmployeeLeave::whereHas('employee', function ($q) use ($stationId) {
                $q->where('station_id', $stationId)
                ->where('active_status', 1);
            })
            ->select('employee_id', 'date', 'leave_type')
            ->get();

        // ✅ Attendance Lookup (cached per station)
        $attendanceRecords = Cache::remember(
            'attendance_lookup_' . $stationId,
            60,
            fn() =>
                Attendance::whereHas('employee', function ($q) use ($stationId) {
                    $q->where('station_id', $stationId)
                    ->where('active_status', 1);
                })
                ->select('employee_id', 'date')
                ->get()
                ->mapWithKeys(fn($a) => [$a->employee_id . '_' . $a->date => true])
                ->toArray()
        );

        return Inertia::render('Admin/AttendanceManagement/AttendanceManagement', [
            'incomplete_attendances' => $incompleteAttendances,
            'employees' => $employees,
            'offices' => $offices,
            'attendance_lookup' => $attendanceRecords,
            'employee_leaves' => $employeeLeaves,
        ]);
    }

    /**
     * Update missing attendance times and recalc tardiness.
     */
    public function update(Request $request, $id)
    {
        $attendance = Attendance::with(['am', 'pm', 'employee'])->findOrFail($id);

        // Update only missing times
        if ($request->filled('am_time_in') && !$attendance->am?->am_time_in) {
            $attendance->am()->updateOrCreate(
                ['attendance_id' => $attendance->id],
                ['am_time_in' => $request->am_time_in]
            );
        }
        if ($request->filled('am_time_out') && !$attendance->am?->am_time_out) {
            $attendance->am()->updateOrCreate(
                ['attendance_id' => $attendance->id],
                ['am_time_out' => $request->am_time_out]
            );
        }
        if ($request->filled('pm_time_in') && !$attendance->pm?->pm_time_in) {
            $attendance->pm()->updateOrCreate(
                ['attendance_id' => $attendance->id],
                ['pm_time_in' => $request->pm_time_in]
            );
        }
        if ($request->filled('pm_time_out') && !$attendance->pm?->pm_time_out) {
            $attendance->pm()->updateOrCreate(
                ['attendance_id' => $attendance->id],
                ['pm_time_out' => $request->pm_time_out]
            );
        }

        $attendance->load(['am', 'pm', 'employee']);
        $this->computeTardiness(collect([$attendance]));

        return redirect()->route('attendancemanagement')
            ->with('success', 'Attendance updated and tardiness recalculated!');
    }

    public function store(Request $request)
    {
        $attendance = Attendance::create([
            'employee_id' => $request->employee_id,
            'date' => $request->date,
        ]);

        $attendance->am()->create([
            'am_time_in' => $request->am_time_in,
            'am_time_out' => $request->am_time_out,
        ]);

        $attendance->pm()->create([
            'pm_time_in' => $request->pm_time_in,
            'pm_time_out' => $request->pm_time_out,
        ]);

        $attendance->load(['am', 'pm', 'employee']);
        $this->computeTardiness(collect([$attendance]));

        return redirect()->route('attendancemanagement')
            ->with('success', 'Attendance created and tardiness calculated!');
    }


    /**
     * Run tardiness computation for Fixed and Full employees.
     */
    private function computeTardiness($attendances)
    {
        $fixed = $attendances->filter(fn($a) => in_array(strtolower($a->employee->work_type), ['fixed', 'work from home']));
        $full  = $attendances->filter(fn($a) => strtolower($a->employee->work_type) === 'full');

        if ($fixed->isNotEmpty()) {
            $this->fixedService->computeForAttendances($fixed);
        }

        if ($full->isNotEmpty()) {
            $this->fullService->computeForAttendances($full);
        }
    }
}
