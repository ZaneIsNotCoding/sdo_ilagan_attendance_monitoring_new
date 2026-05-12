<?php

namespace App\Http\Controllers\Concerns\HandleModalConcerns;

use App\Models\Administrator\Employee;

trait EmployeeModals
{
    public function isEmployeeModal(string $modal): bool
    {
        return request('modal') === $modal;
    }

    public function resolveEmployeeActionModal(string $modal): ?array
    {
        if (! $this->isEmployeeModal($modal)) {
            return null;
        }

        $employee = Employee::with('office:id,name')
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
                'station_id',
                'active_status',
            )
            ->find(request('employee_id'));

        if (! $employee) {
            return null;
        }

        return [
            'id' => $employee->id,
            'full_name' => $this->formatEmployeeName($employee),
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'profile_img' => $employee->profile_img,
            'position' => $employee->position,
            'office_id' => $employee->office_id,
            'office' => $employee->office,
            'station_id' => $employee->station_id,
            'active_status' => $employee->active_status,
        ];
    }

    public function resolveTestFingerprintModal(): bool
    {
        return $this->isEmployeeModal('test-fingerprint');
    }

    public function resolveFingerprintEmployee(int $stationId): ?array
    {
        $employeeId = request('fingerprint_employee_id');

        if (! $employeeId) {
            return null;
        }

        $employee = Employee::with('office.division:id,code,name')
            ->withCount(['biometric'])
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
            )
            ->where('station_id', $stationId)
            ->find($employeeId);

        return $employee ? $this->formatFingerprintEmployee($employee) : null;
    }

    public function formatEmployeeName(?Employee $employee): string
    {
        if (! $employee) {
            return 'Employee';
        }

        $name = preg_replace(
            '/\s+/',
            ' ',
            trim("{$employee->first_name} {$employee->middle_name} {$employee->last_name}"),
        );

        return $name !== '' ? $name : 'Employee';
    }

    public function formatFingerprintEmployee(Employee $employee): array
    {
        $fullName = $this->formatEmployeeName($employee);
        $availableFingers = max(3 - $employee->biometric_count, 0);

        return [
            'id' => $employee->id,
            'label' => $fullName,
            'full_name' => $fullName,
            'meta' => collect([
                $employee->office?->name,
                $employee->office?->division?->code,
            ])->filter()->join(' - '),
            'search' => $fullName,
            'profile_img' => $employee->profile_img,
            'position' => $employee->position,
            'office' => $employee->office,
            'available_fingers' => $availableFingers,
        ];
    }
}
