<?php

namespace App\Repositories\Administrator;

use App\Data\Administrator\DepartmentManagementListFilter\DepartmentEmployeeCandidateFilter;
use App\Models\Administrator\DivisionHead;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Office;
use App\Models\Division;

class DepartmentManagementRepository
{
    public function headRows(string $type, string $search = '')
    {
        $query = DivisionHead::with([
            'employee:id,first_name,middle_name,last_name,profile_img,position,office_id,work_schedule_id',
            'employee.workSchedule.workType:id,name',
            'employee.office:id,name,division_id',
            'employee.office.division:id,code,name',
            'division:id,code,name',
        ])->where('type', $type);

        if ($search !== '') {
            $query->where(function ($query) use ($search) {
                $query->whereHas('division', function ($divisionQuery) use ($search) {
                    $divisionQuery->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                })->orWhereHas('employee.office', function ($officeQuery) use ($search) {
                    $officeQuery->where('name', 'like', "%{$search}%")
                        ->orWhereHas('division', function ($divisionQuery) use ($search) {
                            $divisionQuery->where('code', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%");
                        });
                })->orWhereHas('employee', function ($employeeQuery) use ($search) {
                    $employeeQuery->where('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        );
                });
            });
        }

        return $query->latest()->get();
    }

    public function divisions()
    {
        return Division::select('id', 'code', 'name')
            ->orderBy('code')
            ->get();
    }

    public function offices()
    {
        return Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->orderBy('name')
            ->get();
    }

    public function employeeCandidates(DepartmentEmployeeCandidateFilter $filter)
    {
        $query = Employee::with([
            'office:id,name,division_id',
            'workSchedule.workType:id,name',
        ])
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'work_schedule_id',
                'position',
                'office_id',
                'station_id',
            )
            ->when($filter->officeId !== null, function ($query) use ($filter) {
                $query->where('office_id', $filter->officeId);
            })
            ->when($filter->divisionId !== null, function ($query) use ($filter) {
                $query->whereHas('office', function ($query) use ($filter) {
                    $query->where('division_id', $filter->divisionId);
                });
            })
            ->when($filter->search !== '', function ($query) use ($filter) {
                $query->where(function ($query) use ($filter) {
                    $query->where('id', $filter->search)
                        ->orWhere('first_name', 'like', "%{$filter->search}%")
                        ->orWhere('middle_name', 'like', "%{$filter->search}%")
                        ->orWhere('last_name', 'like', "%{$filter->search}%")
                        ->orWhere('position', 'like', "%{$filter->search}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$filter->search}%"],
                        );
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name');

        return [
            'total' => (clone $query)->count(),
            'data' => $query->limit(10)->get(),
        ];
    }

    public function officeModal(int $officeId): ?Office
    {
        return Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->find($officeId);
    }

    public function headModal(int $headId, string $type): ?DivisionHead
    {
        return DivisionHead::with([
            'employee:id,first_name,middle_name,last_name,profile_img,position,office_id',
            'employee.office:id,name,division_id',
            'employee.office.division:id,code,name',
            'division:id,code,name',
        ])
            ->where('type', $type)
            ->find($headId);
    }

    public function divisionByNameOrCode(string $value): ?Division
    {
        return Division::select('id', 'code', 'name')
            ->where('name', $value)
            ->orWhere('code', $value)
            ->first();
    }

    public function office(int $id): Office
    {
        return Office::findOrFail($id);
    }

    public function employeeWithOffice(int $id): Employee
    {
        return Employee::with('office')->findOrFail($id);
    }

    public function division(int $id): Division
    {
        return Division::findOrFail($id);
    }

    public function divisionHead(int $id): DivisionHead
    {
        return DivisionHead::findOrFail($id);
    }

    public function typedDivisionHead(int $id, string $type): DivisionHead
    {
        return DivisionHead::where('type', $type)->findOrFail($id);
    }

    public function upsertHead(array $identity, array $data): DivisionHead
    {
        return DivisionHead::updateOrCreate($identity, $data);
    }

    public function createDivision(array $data): Division
    {
        return Division::create($data);
    }

    public function createOffice(array $data): Office
    {
        return Office::create($data);
    }
}
