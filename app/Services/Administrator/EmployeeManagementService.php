<?php

namespace App\Services\Administrator;

use App\Data\Administrator\EmployeeManagementListFilter\EmployeeListFilter;
use App\Models\Administrator\Employee;
use App\Repositories\Administrator\EmployeeManagementRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmployeeManagementService
{
    public function __construct(
        private readonly EmployeeManagementRepository $repository,
    ) {}

    public function listLimit(Request $request): int
    {
        return EmployeeListFilter::limitFromRequest($request);
    }

    public function employeeListData(Request $request, int $stationId): array
    {
        $filter = EmployeeListFilter::fromRequest($request, $stationId);
        $offices = $this->repository->offices();

        if ($filter->officeName !== '' && $filter->officeName !== 'all') {
            $officeId = $offices
                ->firstWhere('name', $filter->officeName)
                ?->id ?? 'all';

            $filter = $filter->withOfficeId($officeId);
        }

        $filteredEmployeesList = $this->repository
            ->paginatedEmployees($filter)
            ->through(fn ($employee) => $this->appendEmployeeMeta($employee));

        return [
            'offices' => $offices,
            'filteredEmployeesList' => $filteredEmployeesList,
            'search' => $filter->search,
            'status' => $filter->status,
            'officeName' => $filter->officeId === 'all' ? 'all' : $filter->officeName,
            'limit' => $filter->limit,
        ];
    }

    public function pageOptions(): array
    {
        return [
            'stations' => $this->repository->stations(),
            'workSchedules' => $this->repository->workSchedules(),
        ];
    }

    public function suggestions(Request $request, int $stationId): array
    {
        $search = trim((string) $request->query('search', ''));
        $availableForFingerprint = $request->boolean('available_for_fingerprint');

        return $this->repository
            ->suggestionEmployees($stationId, $search, $availableForFingerprint)
            ->map(fn ($employee) => $this->formatFingerprintEmployee($employee))
            ->all();
    }

    public function editModal(Request $request, string $modal): ?array
    {
        if (! $this->isModal($request, $modal)) {
            return null;
        }

        $employee = $this->repository->editModalEmployee((int) $request->query('employee_id'));

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
            'work_schedule_id' => $employee->work_schedule_id,
            'work_schedule' => $employee->workSchedule,
            'work_type' => $employee->work_type,
            'active_status' => $employee->active_status,
            'is_department_head' => $employee->is_department_head,
            'is_unit_head' => $employee->is_unit_head,
            'is_division_head' => $employee->is_division_head,
            'is_school_admin' => $employee->is_school_admin,
        ];
    }

    public function testFingerprintModal(Request $request): bool
    {
        return $this->isModal($request, 'test-fingerprint');
    }

    public function selectedFingerprintEmployee(Request $request, int $stationId): ?array
    {
        $fingerprintEmployee = $request->query(
            'fingerprint_registration',
            $request->query('fingerprint_employee_id'),
        );
        $employeeId = (int) preg_replace('/\D.*/', '', (string) $fingerprintEmployee);

        if (! $employeeId) {
            return null;
        }

        $employee = $this->repository->fingerprintEmployee($stationId, $employeeId);

        return $employee ? $this->formatFingerprintEmployee($employee) : null;
    }

    public function store(array $validated, Request $request): Employee
    {
        if ($request->hasFile('profile_img')) {
            $validated['profile_img'] = $request->file('profile_img')->store(
                'employee-profile-images',
                'public',
            );
        }

        return $this->repository->create($validated);
    }

    public function update(int $id, array $validated, Request $request): Employee
    {
        $employee = $this->repository->findOrFail($id);

        if ($request->hasFile('profile_img')) {
            if ($employee->profile_img) {
                Storage::disk('public')->delete($employee->profile_img);
            }

            $validated['profile_img'] = $request->file('profile_img')->store(
                'employee-profile-images',
                'public',
            );
        }

        $employee->update($validated);

        return $employee;
    }

    public function fingerprintServiceUrl(Request $request): string
    {
        return rtrim(
            env('BIOMETRIC_SERVICE_URL') ?: $request->getScheme() . '://' . $request->getHost() . ':5000',
            '/',
        );
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
        $availableFingers = max(3 - (int) $employee->biometrics_count, 0);

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

    public function successName(array $employeeData): string
    {
        return trim(
            preg_replace(
                '/\s+/',
                ' ',
                implode(' ', [
                    $employeeData['first_name'] ?? '',
                    $employeeData['middle_name'] ?? '',
                    $employeeData['last_name'] ?? '',
                ]),
            ),
        );
    }

    private function appendEmployeeMeta(Employee $employee): Employee
    {
        $employee->available_fingers = max(3 - (int) $employee->biometrics_count, 0);

        $employee->is_department_head = $employee->roles
            ->where('type', 'department_head')
            ->isNotEmpty();

        return $employee;
    }

    private function isModal(Request $request, string $modal): bool
    {
        return $request->query('modal') === $modal;
    }
}
