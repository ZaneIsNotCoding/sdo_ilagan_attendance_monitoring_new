<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Attendance;
use App\Services\TardinessConvertion\FixedFlexiTardinessService;
use App\Services\TardinessConvertion\FullFlexiTardinessService;
use App\Models\EmployeeLeave;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class DailyTimeRecordController extends Controller
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

    /**
     * Display all daily time records.
     */
    public function index()
    {
        $user = auth()->user();
        $stationId = optional($user->employee)->station_id;

        if (!$stationId) {
            abort(403, 'Station not assigned to this user.');
        }

        // ✅ Fixed / Work From Home Attendances (station + active)
        $fixedAttendances = Attendance::whereHas('employee', function ($q) use ($stationId) {
                $q->where('station_id', $stationId)
                ->whereIn('work_type', ['fixed', 'work from home'])
                ->where('active_status', 1);
            })
            ->doesntHave('tardinessRecord')
            ->with([
                'am:id,attendance_id,am_time_in,am_time_out',
                'pm:id,attendance_id,pm_time_in,pm_time_out',
                'employee:id,work_type,station_id,active_status'
            ])
            ->get();

        // ✅ Full Attendances (station + active)
        $fullAttendances = Attendance::whereHas('employee', function ($q) use ($stationId) {
                $q->where('station_id', $stationId)
                ->where('work_type', 'full')
                ->where('active_status', 1);
            })
            ->doesntHave('tardinessRecord')
            ->with([
                'am:id,attendance_id,am_time_in,am_time_out',
                'pm:id,attendance_id,pm_time_in,pm_time_out',
                'employee:id,work_type,station_id,active_status'
            ])
            ->get();

        // ✅ Compute tardiness
        if ($fixedAttendances->isNotEmpty()) {
            $this->fixedService->computeForAttendances($fixedAttendances);
        }

        if ($fullAttendances->isNotEmpty()) {
            $this->fullService->computeForAttendances($fullAttendances);
        }

        // ✅ Employees (filtered)
        $time_record = Employee::where('station_id', $stationId)
            ->where('active_status', 1)
            ->orderBy('last_name')
            ->get();

        return Inertia::render('Admin/DailyTimeRecord/DailyTimeRecord', [
            'time_record' => $time_record,
        ]);
    }

    /**
     * Show detailed daily time record for a specific employee.
     */
    public function show($id)
    {
        // Compute tardiness for this employee’s recent/unprocessed attendances
        $attendances = Attendance::where('employee_id', $id)
            ->doesntHave('tardinessRecord')
            ->with(['am', 'pm', 'employee'])
            ->get();
        $employeeLeaves = EmployeeLeave::where('employee_id', $id)->get();

        $time_record = Employee::with([
            'attendances.am',
            'attendances.pm',
            'attendances.tardinessRecord'
        ])->findOrFail($id);

        // Monthly tardiness totals
        $monthlyTotals = $time_record->attendances
            ->groupBy(fn($att) => Carbon::parse($att->date)->format('Y-m'))
            ->map(fn($monthGroup) => $monthGroup->sum(fn($att) => $att->tardinessRecord->converted_tardy ?? 0));

        return Inertia::render('Admin/DailyTimeRecord/ViewDtr', [
            'time_record'     => $time_record,
            'monthly_totals'  => $monthlyTotals,
            'employee_leaves' => $employeeLeaves,
        ]);
    }

    public function details($employeeId)
    {
        $time_record = Employee::with([
            'attendances.am',
            'attendances.pm',
            'attendances.tardinessRecord'
        ])->findOrFail($employeeId);

        $monthly_totals = $time_record->attendances
            ->groupBy(fn($att) => \Carbon\Carbon::parse($att->date)->format('Y-m'))
            ->map(fn($monthGroup) => $monthGroup->sum(fn($att) => $att->tardinessRecord->converted_tardy ?? 0));

        return response()->json([
            'time_record' => $time_record,
            'monthly_totals' => $monthly_totals
        ]);
    }



    /**
     * Run tardiness computation for Fixed and Full employees.
     */
    private function computeTardiness($attendances)
    {
        // Filter attendances for fixed or work-from-home employees
        $fixed = $attendances->filter(fn($a) => in_array(strtolower($a->employee->work_type), ['fixed', 'work from home']));

        // Filter attendances for full employees
        $full  = $attendances->filter(fn($a) => strtolower($a->employee->work_type) === 'full');

        if ($fixed->isNotEmpty()) {
            $this->fixedService->computeForAttendances($fixed);
        }

        if ($full->isNotEmpty()) {
            $this->fullService->computeForAttendances($full);
        }
    }
}