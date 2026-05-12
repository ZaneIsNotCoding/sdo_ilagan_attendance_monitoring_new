<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\Office;
use App\Services\TardinessConvertion\FixedFlexiTardinessService;
use App\Services\TardinessConvertion\FullFlexiTardinessService;
use App\Models\EmployeeLeave;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Http\Request;

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
        $search = trim((string) request('search', ''));
        $officeName = trim((string) request('office', 'all'));
        $officeId = 'all';
        $limit = (int) request('limit', 10);

        if (!$stationId) {
            abort(403, 'Station not assigned to this user.');
        }

        if (! in_array($limit, [10, 25, 50, 100], true)) {
            $limit = 10;
        }

        if ((string) request('limit') !== (string) $limit) {
            return redirect()->to(request()->fullUrlWithQuery([
                'limit' => $limit,
            ]));
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

        $officeIds = Employee::where('station_id', $stationId)
            ->where('active_status', 1)
            ->whereNotNull('office_id')
            ->distinct()
            ->pluck('office_id');

        $offices = Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->whereIn('id', $officeIds)
            ->orderBy('name')
            ->get();

        if ($officeName !== '' && $officeName !== 'all') {
            $officeId = $offices
                ->firstWhere('name', $officeName)
                ?->id ?? 'all';
        }

        $time_record = Employee::with('office:id,name')
            ->where('station_id', $stationId)
            ->where('active_status', 1)
            ->when($officeId !== 'all', function ($query) use ($officeId) {
                $query->where('office_id', (int) $officeId);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($employeeQuery) use ($search) {
                    $employeeQuery->where('id', $search)
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('position', 'like', "%{$search}%")
                        ->orWhere('work_type', 'like', "%{$search}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        )
                        ->orWhereRaw(
                            "CONCAT_WS(' ', id, first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        )
                        ->orWhereHas('office', function ($officeQuery) use ($search) {
                            $officeQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($limit)
            ->withQueryString();

        return Inertia::render('Admin/DailyTimeRecord/DailyTimeRecord', [
            'time_record' => $time_record,
            'offices' => $offices,
            'search' => $search,
            'office' => $officeId === 'all' ? 'all' : $officeName,
            'limit' => $limit,
        ]);
    }

    public function suggestions(Request $request)
    {
        $user = auth()->user();
        $stationId = optional($user->employee)->station_id;
        $search = trim((string) $request->query('search', ''));

        if (!$stationId || $search === '') {
            return response()->json([]);
        }

        $employees = Employee::with('office:id,name')
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
                'work_type',
                'station_id',
                'active_status',
            )
            ->where('station_id', $stationId)
            ->where('active_status', 1)
            ->where(function ($query) use ($search) {
                $query->where('id', $search)
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhereRaw(
                        "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                        ["%{$search}%"],
                    )
                    ->orWhereRaw(
                        "CONCAT_WS(' ', id, first_name, middle_name, last_name) LIKE ?",
                        ["%{$search}%"],
                    )
                    ->orWhereHas('office', function ($officeQuery) use ($search) {
                        $officeQuery->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(8)
            ->get()
            ->map(function ($employee) {
                $fullName = trim(
                    preg_replace(
                        '/\s+/',
                        ' ',
                        implode(' ', [
                            $employee->first_name ?? '',
                            $employee->middle_name ?? '',
                            $employee->last_name ?? '',
                        ]),
                    ),
                );

                return [
                    'id' => $employee->id,
                    'label' => $fullName !== '' ? $fullName : '-',
                    'meta' => collect([
                        $employee->department,
                        $employee->position,
                    ])->filter()->join(' • '),
                    'search' => $fullName,
                ];
            });

        return response()->json($employees);
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
