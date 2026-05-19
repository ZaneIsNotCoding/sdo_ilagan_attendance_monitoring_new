<?php

namespace App\Repositories\Administrator;

use App\Data\Administrator\DailyTimeRecordListFilter\DailyTimeRecordFilter;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\DivisionHead;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Office;
use App\Models\Administrator\WorkSchedule;
use App\Models\Administrator\WorkType;
use App\Models\EmployeeLeave;

class DailyTimeRecordRepository
{
    public function workTypes()
    {
        return WorkType::withCount('workSchedules')
            ->select('id', 'name', 'created_at', 'updated_at')
            ->orderBy('name')
            ->get();
    }

    public function workSchedules()
    {
        return WorkSchedule::with('workType:id,name')
            ->select('id', 'work_type_id', 'name', 'time_in', 'time_out', 'created_at', 'updated_at')
            ->orderBy('work_type_id')
            ->orderBy('time_in')
            ->get();
    }

    public function workTypeModal(int $id): ?WorkType
    {
        return WorkType::select('id', 'name')->find($id);
    }

    public function workScheduleModal(int $id): ?WorkSchedule
    {
        return WorkSchedule::with('workType:id,name')
            ->select('id', 'work_type_id', 'name', 'time_in', 'time_out')
            ->find($id);
    }

    public function unprocessedAttendancesByWorkTypes(int $stationId, array $workTypes)
    {
        return Attendance::whereHas('employee', function ($query) use ($stationId, $workTypes) {
            $query->where('station_id', $stationId)
                ->whereHas('workSchedule.workType', function ($query) use ($workTypes) {
                    $query->whereIn('name', $workTypes);
                })
                ->where('active_status', 1);
        })
            ->with([
                'am:id,attendance_id,am_time_in,am_time_out',
                'pm:id,attendance_id,pm_time_in,pm_time_out',
                'employee:id,work_schedule_id,station_id,active_status',
                'employee.workSchedule:id,work_type_id,time_in,time_out',
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
        return Employee::with([
            'office:id,name,division_id',
            'office.division:id,code,name',
            'workSchedule.workType:id,name',
        ])
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
            ->orderByName()
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
            ->orderByName()
            ->limit(8)
            ->get();
    }

    public function employeeLeaves(int $employeeId)
    {
        return EmployeeLeave::where('employee_id', $employeeId)->get();
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

    public function printOfficesForStation(int $stationId, string $search, int $month, int $year)
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

    public function printEmployeesForOffice(
        int $stationId,
        string $officeName,
        int $month,
        int $year,
        int $perPage = 3,
        int $page = 1,
    )
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
            ->orderByName()
            ->paginate($perPage, ['*'], 'page', $page);
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

    public function headRoleForEmployee(int $employeeId, string $type): ?DivisionHead
    {
        return DivisionHead::with([
            'division:id,code,name',
            'office:id,name,division_id',
        ])
            ->where('employee_id', $employeeId)
            ->where('type', $type)
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

    public function osdsDivisionHeadForStation(?int $stationId): ?DivisionHead
    {
        if (! $stationId) {
            return null;
        }

        return DivisionHead::with([
            'employee:id,first_name,middle_name,last_name,profile_img,position,office_id,station_id,active_status',
            'division:id,code,name',
        ])
            ->where('type', 'division_head')
            ->whereHas('division', function ($query) {
                $query->where('code', 'OSDS');
            })
            ->whereHas('employee', function ($query) use ($stationId) {
                $query->where('station_id', $stationId)
                    ->where('active_status', 1);
            })
            ->latest()
            ->first();
    }

    public function createWorkType(array $data): WorkType
    {
        return WorkType::create($data);
    }

    public function updateWorkType(WorkType $workType, array $data): void
    {
        $workType->update($data);
    }

    public function deleteWorkType(WorkType $workType): void
    {
        $workType->delete();
    }

    public function createWorkSchedule(array $data): WorkSchedule
    {
        return WorkSchedule::create($data);
    }

    public function updateWorkSchedule(WorkSchedule $workSchedule, array $data): void
    {
        $workSchedule->update($data);
    }

    public function deleteWorkSchedule(WorkSchedule $workSchedule): void
    {
        $workSchedule->delete();
    }
}
