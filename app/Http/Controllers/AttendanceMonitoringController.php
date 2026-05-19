<?php

namespace App\Http\Controllers;

use App\Models\Administrator\Attendance;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceMonitoringController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();
        $search = trim((string) $request->query('search', ''));
        $stationCode = trim((string) $request->query('station_code', ''));
        $stationName = trim((string) $request->query('station_name', 'School Division Office'));

        $selectedStation = $this->resolveSelectedStation($request);
        $stationId = $selectedStation?->id ?? 1;
        $stationCode = $selectedStation?->code ?? ($stationCode ?: 'SDO');
        $stationName = $selectedStation?->name ?? ($stationName ?: 'School Division Office');

        if (
            $request->query('station_id') ||
            ! $request->query('page') ||
            (string) $request->query('station_code') !== (string) $stationCode ||
            (string) $request->query('station_name') !== (string) $stationName ||
            $request->query('limit')
        ) {
            $query = $request->query();
            unset($query['station_id']);
            unset($query['limit']);

            return redirect()->route('attendance-monitoring', array_merge($query, [
                'page' => $request->query('page', 1),
                'station_code' => $stationCode,
                'station_name' => $stationName,
            ]));
        }

        $employees = Employee::query()
            ->with('station:id,name,code')
            ->leftJoin('stations', 'stations.id', '=', 'employees.station_id')
            ->select([
                'employees.id',
                'employees.first_name',
                'employees.middle_name',
                'employees.last_name',
                'employees.profile_img',
                'employees.position',
                'employees.station_id',
            ])
            ->where('employees.station_id', $stationId)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('employees.id', $search)
                        ->orWhere('employees.first_name', 'like', "%{$search}%")
                        ->orWhere('employees.middle_name', 'like', "%{$search}%")
                        ->orWhere('employees.last_name', 'like', "%{$search}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', employees.first_name, employees.middle_name, employees.last_name) LIKE ?",
                            ["%{$search}%"],
                        )
                        ->orWhere('stations.name', 'like', "%{$search}%")
                        ->orWhere('stations.code', 'like', "%{$search}%");
                });
            })
            ->orderByRaw("CASE WHEN stations.code = 'SDO' THEN 0 ELSE 1 END")
            ->orderBy('stations.name')
            ->orderBy('employees.first_name')
            ->paginate(16)
            ->withQueryString();

        $employeeIds = $employees->getCollection()->pluck('id');

        $attendanceByEmployee = Attendance::with(['am', 'pm'])
            ->whereDate('date', $today)
            ->whereIn('employee_id', $employeeIds)
            ->latest()
            ->get()
            ->unique('employee_id')
            ->keyBy('employee_id');

        $employees->setCollection($employees->getCollection()
            ->map(function ($employee) use ($attendanceByEmployee) {
                $attendance = $attendanceByEmployee->get($employee->id);
                $status = $this->getAttendanceStatus($attendance);

                return [
                    'id' => $employee->id,
                    'employee_id' => $employee->id,
                    'first_name' => $employee->first_name,
                    'middle_name' => $employee->middle_name,
                    'last_name' => $employee->last_name,
                    'profile_img' => $employee->profile_img,
                    'position' => $employee->position,
                    'station' => $employee->station,
                    'am_in' => $attendance?->am?->am_time_in,
                    'am_out' => $attendance?->am?->am_time_out,
                    'pm_in' => $attendance?->pm?->pm_time_in,
                    'pm_out' => $attendance?->pm?->pm_time_out,
                    'status' => $status,
                ];
            }));

        $stations = Station::query()
            ->select('id', 'name', 'code')
            ->orderByRaw("CASE WHEN code = 'SDO' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->limit(20)
            ->get();

        if ($selectedStation && ! $stations->contains('id', $selectedStation->id)) {
            $stations->prepend($selectedStation);
        }

        return Inertia::render('AttendanceMonitoring/AttendanceMonitoring', [
            'employees' => $employees,
            'stations' => $stations->values(),
            'filters' => [
                'search' => $search,
                'station_id' => $stationId,
                'station_code' => $stationCode,
                'station_name' => $stationName,
            ],
        ]);
    }

    public function stationSuggestions(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        if ($search === '') {
            return response()->json([]);
        }

        $stations = Station::query()
            ->select('id', 'name', 'code')
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->orderByRaw("CASE WHEN code = 'SDO' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->limit(8)
            ->get()
            ->map(fn ($station) => [
                'id' => $station->id,
                'code' => $station->code,
                'name' => $station->name,
            ]);

        return response()->json($stations);
    }

    public function employeeSuggestions(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        if ($search === '') {
            return response()->json([]);
        }

        $selectedStation = $this->resolveSelectedStation($request);
        $stationId = $selectedStation?->id ?? 1;

        $employees = Employee::query()
            ->with('station:id,name,code')
            ->select([
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'station_id',
            ])
            ->where('station_id', $stationId)
            ->where(function ($query) use ($search) {
                $query->where('id', $search)
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhereRaw(
                        "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                        ["%{$search}%"],
                    );
            })
            ->orderByName()
            ->limit(8)
            ->get()
            ->map(function ($employee) {
                $fullName = collect([
                    $employee->first_name,
                    $employee->middle_name,
                    $employee->last_name,
                ])->filter()->join(' ');

                return [
                    'id' => $employee->id,
                    'name' => $fullName,
                    'position' => $employee->position,
                    'station' => $employee->station?->name,
                ];
            });

        return response()->json($employees);
    }

    private function resolveSelectedStation(Request $request): ?Station
    {
        $stationCode = trim((string) $request->query('station_code', ''));

        if ($stationCode !== '') {
            $station = Station::select('id', 'name', 'code')
                ->where('code', $stationCode)
                ->first();

            if ($station) {
                return $station;
            }
        }

        $stationName = trim((string) $request->query('station_name', 'School Division Office'));

        if ($stationName !== '') {
            $station = Station::select('id', 'name', 'code')
                ->where('name', $stationName)
                ->orWhere('code', $stationName)
                ->first();

            if ($station) {
                return $station;
            }
        }

        return Station::select('id', 'name', 'code')
            ->where('code', 'SDO')
            ->orWhere('id', 1)
            ->orderByRaw("CASE WHEN code = 'SDO' THEN 0 ELSE 1 END")
            ->first();
    }

    private function getAttendanceStatus(?Attendance $attendance): string
    {
        if (! $attendance) {
            return 'Absent';
        }

        if (
            $attendance->am?->am_time_in &&
            Carbon::parse($attendance->am->am_time_in)->format('H:i:s') > '08:00:00'
        ) {
            return 'Late';
        }

        return 'Present';
    }
}
