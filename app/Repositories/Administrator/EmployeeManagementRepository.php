<?php

namespace App\Repositories\Administrator;

use App\Data\Administrator\EmployeeManagementListFilter\EmployeeListFilter;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Office;
use App\Models\Administrator\Station;
use App\Models\Administrator\WorkSchedule;

class EmployeeManagementRepository
{
    public function offices()
    {
        return Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->orderBy('name')
            ->get();
    }

    public function stations()
    {
        return Station::select('id', 'name')->get();
    }

    public function workSchedules()
    {
        return WorkSchedule::with('workType:id,name')
            ->select('id', 'work_type_id', 'name', 'time_in', 'time_out')
            ->orderBy('work_type_id')
            ->orderBy('time_in')
            ->get();
    }

    public function paginatedEmployees(EmployeeListFilter $filter)
    {
        return Employee::with([
            'roles',
            'office.division',
            'workSchedule.workType',
        ])
            ->withCount(['biometrics'])
            ->where('station_id', $filter->stationId)
            ->when($filter->search !== '', function ($query) use ($filter) {
                $query->where(function ($query) use ($filter) {
                    $query->where('id', $filter->search)
                        ->orWhere('first_name', 'like', "%{$filter->search}%")
                        ->orWhere('middle_name', 'like', "%{$filter->search}%")
                        ->orWhere('last_name', 'like', "%{$filter->search}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$filter->search}%"],
                        )
                        ->orWhereRaw(
                            "CONCAT_WS(' ', id, first_name, middle_name, last_name) LIKE ?",
                            ["%{$filter->search}%"],
                        );
                });
            })
            ->when($filter->officeId !== 'all', function ($query) use ($filter) {
                $query->where('office_id', (int) $filter->officeId);
            })
            ->where('active_status', $filter->status === 'Active' ? 1 : 0)
            ->orderBy('first_name')
            ->orderBy('middle_name')
            ->orderBy('last_name')
            ->orderBy('id')
            ->paginate($filter->limit)
            ->withQueryString();
    }

    public function suggestionEmployees(
        int $stationId,
        string $search,
        bool $availableForFingerprint,
    ) {
        return Employee::with('office.division:id,code,name')
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
            )
            ->withCount(['biometrics'])
            ->where('station_id', $stationId)
            ->when($availableForFingerprint, function ($query) {
                $query->having('biometrics_count', '<', 3);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('id', $search)
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        )
                        ->orWhereRaw(
                            "CONCAT_WS(' ', id, first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        );
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(10)
            ->get();
    }

    public function editModalEmployee(int $employeeId): ?Employee
    {
        return Employee::with([
            'office:id,name',
            'workSchedule.workType:id,name',
        ])
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
                'station_id',
                'work_schedule_id',
                'active_status',
            )
            ->find($employeeId);
    }

    public function fingerprintEmployee(int $stationId, int $employeeId): ?Employee
    {
        return Employee::with('office.division:id,code,name')
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
            )
            ->withCount(['biometrics'])
            ->where('station_id', $stationId)
            ->having('biometrics_count', '<', 3)
            ->find($employeeId);
    }

    public function create(array $data): Employee
    {
        return Employee::create($data);
    }

    public function findOrFail(int $id): Employee
    {
        return Employee::findOrFail($id);
    }
}
