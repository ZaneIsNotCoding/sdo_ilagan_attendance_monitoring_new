<?php

namespace App\Http\Controllers\Concerns\HandleModalConcerns;

use App\Models\Administrator\DivisionHead;
use App\Models\Administrator\Office;

trait DeparmentModals
{
    public function isDepartmentModal(string $modal): bool
    {
        return request('modal') === $modal;
    }

    public function resolveOfficeModal(string $modal): ?array
    {
        if (! $this->isDepartmentModal($modal)) {
            return null;
        }

        $office = Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->find(request('office_id'));

        if (! $office) {
            return null;
        }

        return [
            'id' => $office->id,
            'division_id' => $office->division_id,
            'name' => $office->name,
            'division' => $office->division,
        ];
    }

    public function resolveOfficeHeadModal(string $modal): ?array
    {
        if (! $this->isDepartmentModal($modal)) {
            return null;
        }

        $head = DivisionHead::with([
            'employee:id,first_name,middle_name,last_name,profile_img,position,office_id',
            'employee.office:id,name,division_id',
            'employee.office.division:id,code,name',
            'division:id,code,name',
        ])
            ->where('type', 'unit_head')
            ->find(request('head_id'));

        if (! $head) {
            return null;
        }

        return [
            'id' => $head->id,
            'employee_name' => $this->formatDepartmentEmployeeName($head->employee),
            'office_name' => $head->employee?->office?->name,
            'division_name' => $head->employee?->office?->division?->name,
        ];
    }

    public function resolveDivisionHeadModal(string $modal): ?array
    {
        if (! $this->isDepartmentModal($modal)) {
            return null;
        }

        $head = DivisionHead::with([
            'employee:id,first_name,middle_name,last_name,profile_img,position,office_id',
            'division:id,code,name',
        ])
            ->where('type', 'division_head')
            ->find(request('head_id'));

        if (! $head) {
            return null;
        }

        return [
            'id' => $head->id,
            'employee_name' => $this->formatDepartmentEmployeeName($head->employee),
            'division_code' => $head->division?->code,
            'division_name' => $head->division?->name,
        ];
    }

    public function resolveAssignOfficeHeadModal(): ?array
    {
        if (! $this->isDepartmentModal('assign-office-head')) {
            return null;
        }

        $office = Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->find(request('office_id'));

        if (! $office) {
            return null;
        }

        return [
            'office_id' => $office->id,
            'office_name' => $office->name,
            'division_name' => $office->division?->name,
        ];
    }

    public function formatDepartmentEmployeeName($employee): string
    {
        if (! $employee) {
            return 'Employee';
        }

        $name = preg_replace(
            '/\s+/',
            ' ',
            trim("{$employee->first_name} {$employee->middle_name} {$employee->last_name}"),
        ) ?? '';

        return $name !== '' ? $name : 'Employee';
    }
}
