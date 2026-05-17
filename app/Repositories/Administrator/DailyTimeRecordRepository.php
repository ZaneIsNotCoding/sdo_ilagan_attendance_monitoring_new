<?php

namespace App\Repositories\Administrator;

use App\Data\Administrator\DailyTimeRecordListFilter\DailyTimeRecordFilter;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\DivisionHead;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Office;
use App\Models\EmployeeLeave;

class DailyTimeRecordRepository
{
    public function unprocessedAttendancesByWorkTypes(int $stationId, array $workTypes)
    {
        return Attendance::whereHas('employee', function ($query) use ($stationId, $workTypes) {
            $query->where('station_id', $stationId)
                ->whereHas('workSchedule.workType', function ($query) use ($workTypes) {
                    $query->whereIn('name', $workTypes);
                })
                ->where('active_status', 1);
        })
            ->doesntHave('tardinessRecord')
            ->with([
                'am:id,attendance_id,am_time_in,am_time_out',
                'pm:id,attendance_id,pm_time_in,pm_time_out',
                'employee:id,work_schedule_id,station_id,active_status',
                'employee.workSchedule.workType:id,name',
            ])
            ->get();
    }

    public function officesForStation(int $stationId)
    {
        $officeIds = Employee::where('station_id', $stationId)
            ->where('active_status', 1)
            ->whereNotNull('office_id')
            ->distinct()
            ->pluck('office_id');

        return Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->whereIn('id', $officeIds)
            ->orderBy('name')
            ->get();
    }

    public function paginatedEmployees(DailyTimeRecordFilter $filter)
    {
        return Employee::with(['office:id,name', 'workSchedule.workType:id,name'])
            ->where('station_id', $filter->stationId)
            ->where('active_status', 1)
            ->when($filter->officeId !== 'all', function ($query) use ($filter) {
                $query->where('office_id', (int) $filter->officeId);
            })
            ->whereHas('attendances', function ($query) use ($filter) {
                $query->whereYear('date', $filter->year)
                    ->whereMonth('date', $filter->month);
            })
            ->when($filter->search !== '', function ($query) use ($filter) {
                $query->where(function ($employeeQuery) use ($filter) {
                    $employeeQuery->where('id', $filter->search)
                        ->orWhere('first_name', 'like', "%{$filter->search}%")
                        ->orWhere('middle_name', 'like', "%{$filter->search}%")
                        ->orWhere('last_name', 'like', "%{$filter->search}%")
                        ->orWhere('position', 'like', "%{$filter->search}%")
                        ->orWhereHas('workSchedule.workType', function ($workTypeQuery) use ($filter) {
                            $workTypeQuery->where('name', 'like', "%{$filter->search}%");
                        })
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$filter->search}%"],
                        )
                        ->orWhereRaw(
                            "CONCAT_WS(' ', id, first_name, middle_name, last_name) LIKE ?",
                            ["%{$filter->search}%"],
                        )
                        ->orWhereHas('office', function ($officeQuery) use ($filter) {
                            $officeQuery->where('name', 'like', "%{$filter->search}%");
                        });
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($filter->limit)
            ->withQueryString();
    }

    public function suggestionEmployees(int $stationId, string $search)
    {
        if ($search === '') {
            return collect();
        }

        return Employee::with(['office:id,name', 'workSchedule.workType:id,name'])
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
                'work_schedule_id',
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
            ->get();
    }

    public function employeeLeaves(int $employeeId)
    {
        return EmployeeLeave::where('employee_id', $employeeId)->get();
    }

    public function employeeTimeRecord(int $employeeId): Employee
    {
        return Employee::with([
            'office:id,name,division_id',
            'office.division:id,code,name',
            'attendances.am',
            'attendances.pm',
            'attendances.tardinessRecord',
        ])->findOrFail($employeeId);
    }

    public function employeeTimeRecordForStation(int $employeeId, int $stationId): ?Employee
    {
        return Employee::with([
            'office:id,name,division_id',
            'office.division:id,code,name',
            'attendances.am',
            'attendances.pm',
            'attendances.tardinessRecord',
        ])
            ->where('station_id', $stationId)
            ->find($employeeId);
    }

    public function printDepartmentsForStation(int $stationId, string $search, int $month, int $year)
    {
        return Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->whereHas('employees', function ($query) use ($stationId, $month, $year) {
                $query->where('station_id', $stationId)
                    ->where('active_status', 1)
                    ->whereHas('attendances', function ($attendanceQuery) use ($month, $year) {
                        $attendanceQuery->whereYear('date', $year)
                            ->whereMonth('date', $month);
                    });
            })
            ->withCount([
                'employees as employees_count' => function ($query) use ($stationId, $month, $year) {
                    $query->where('station_id', $stationId)
                        ->where('active_status', 1)
                        ->whereHas('attendances', function ($attendanceQuery) use ($month, $year) {
                            $attendanceQuery->whereYear('date', $year)
                                ->whereMonth('date', $month);
                        });
                },
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($officeQuery) use ($search) {
                    $officeQuery->where('name', 'like', "%{$search}%")
                        ->orWhereHas('division', function ($divisionQuery) use ($search) {
                            $divisionQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('code', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('name')
            ->limit(6)
            ->get();
    }

    public function printEmployeesForOffice(int $stationId, string $officeName, int $month, int $year)
    {
        return Employee::with(['office:id,name,division_id', 'office.division:id,code,name'])
            ->where('station_id', $stationId)
            ->where('active_status', 1)
            ->whereHas('office', function ($query) use ($officeName) {
                $query->where('name', $officeName);
            })
            ->whereHas('attendances', function ($query) use ($month, $year) {
                $query->whereYear('date', $year)
                    ->whereMonth('date', $month);
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();
    }

    public function officeHeadForOffice(?int $officeId): ?DivisionHead
    {
        if (! $officeId) {
            return null;
        }

        return DivisionHead::with([
            'employee:id,first_name,middle_name,last_name,profile_img,position,office_id',
        ])
            ->where('type', 'unit_head')
            ->where('office_id', $officeId)
            ->latest()
            ->first();
    }

    public function divisionHeadForDivision(?int $divisionId): ?DivisionHead
    {
        if (! $divisionId) {
            return null;
        }

        return DivisionHead::with([
            'employee:id,first_name,middle_name,last_name,profile_img,position,office_id',
        ])
            ->where('type', 'division_head')
            ->where('division_id', $divisionId)
            ->latest()
            ->first();
    }
}
