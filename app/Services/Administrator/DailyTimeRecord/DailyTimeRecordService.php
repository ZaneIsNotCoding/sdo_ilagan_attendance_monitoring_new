<?php

namespace App\Services\Administrator\DailyTimeRecord;

use App\Data\Administrator\DailyTimeRecordListFilter\DailyTimeRecordFilter;
use App\Models\Administrator\Employee;
use App\Repositories\Administrator\DailyTimeRecordRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DailyTimeRecordService
{
    public function __construct(
        private readonly DailyTimeRecordRepository $repository,
        private readonly FixedTardinessService $fixedService,
        private readonly FullTardinessService $fullService,
    ) {}

    public function listLimit(Request $request): int
    {
        return DailyTimeRecordFilter::fromRequest($request, 0)->limit;
    }

    public function pageData(Request $request, int $stationId): array
    {
        $this->computeStationTardiness($stationId);

        $filter = DailyTimeRecordFilter::fromRequest($request, $stationId);
        $offices = $this->repository->officesForStation($stationId);

        if ($filter->officeName !== '' && $filter->officeName !== 'all') {
            $officeId = $offices
                ->firstWhere('name', $filter->officeName)
                ?->id ?? 'all';

            $filter = $filter->withOfficeId($officeId);
        }

        return [
            'time_record' => $this->repository->paginatedEmployees($filter),
            'offices' => $offices,
            'search' => $filter->search,
            'office' => $filter->officeId === 'all' ? 'all' : $filter->officeName,
            'month' => $filter->month,
            'year' => $filter->year,
            'limit' => $filter->limit,
            'previewDtrModal' => $this->previewDtrModal($request, $stationId),
            'printDtrModal' => $this->printDtrModal($request, $stationId),
            'departmentPrintModal' => $this->departmentPrintModal($request),
        ];
    }

    public function suggestions(Request $request, int $stationId): array
    {
        $search = trim((string) $request->query('search', ''));

        return $this->repository
            ->suggestionEmployees($stationId, $search)
            ->map(fn (Employee $employee) => $this->formatSuggestion($employee))
            ->all();
    }

    public function showData(int $employeeId): array
    {
        $timeRecord = $this->repository->employeeTimeRecord($employeeId);

        return [
            'time_record' => $timeRecord,
            'monthly_totals' => $this->monthlyTotalsForEmployee($timeRecord),
            'employee_leaves' => $this->repository->employeeLeaves($employeeId),
            'signatory' => $this->officeHeadSignatory($timeRecord),
            'signatories' => $this->availableSignatories($timeRecord),
        ];
    }

    public function detailsData(int $employeeId): array
    {
        $timeRecord = $this->repository->employeeTimeRecord($employeeId);

        return [
            'time_record' => $timeRecord,
            'monthly_totals' => $this->monthlyTotalsForEmployee($timeRecord),
            'employee_leaves' => $this->repository->employeeLeaves($employeeId),
            'signatory' => $this->officeHeadSignatory($timeRecord),
            'signatories' => $this->availableSignatories($timeRecord),
        ];
    }

    public function previewDtrModal(Request $request, int $stationId): ?array
    {
        if ($request->query('modal') !== 'preview-dtr') {
            return null;
        }

        $employeeId = (int) $request->query('employee_id');

        if (! $employeeId) {
            abort(404, 'DTR preview not found.');
        }

        $timeRecord = $this->repository->employeeTimeRecordForStation(
            $employeeId,
            $stationId,
        );

        if (! $timeRecord) {
            abort(404, 'DTR preview not found.');
        }

        return [
            'name' => trim((string) $request->query('name', '')),
            'time_record' => $timeRecord,
            'monthly_totals' => $this->monthlyTotalsForEmployee($timeRecord),
            'employee_leaves' => $this->repository->employeeLeaves($employeeId),
            'signatory' => $this->officeHeadSignatory($timeRecord),
            'signatories' => $this->availableSignatories($timeRecord),
        ];
    }

    public function printDtrModal(Request $request, int $stationId): ?array
    {
        if ($request->query('modal') !== 'print-dtr') {
            return null;
        }

        $employeeId = (int) $request->query('employee_id');

        if (! $employeeId) {
            abort(404, 'DTR print record not found.');
        }

        $employee = $this->repository->employeeTimeRecordForStation(
            $employeeId,
            $stationId,
        );

        if (! $employee) {
            abort(404, 'DTR print record not found.');
        }

        return [
            'name' => trim((string) $request->query('name', '')),
            'employee' => $this->formatPrintEmployee($employee),
            'details' => [
                'time_record' => $employee,
                'monthly_totals' => $this->monthlyTotalsForEmployee($employee),
                'employee_leaves' => $this->repository->employeeLeaves($employeeId),
                'signatory' => $this->officeHeadSignatory($employee),
                'signatories' => $this->availableSignatories($employee),
            ],
        ];
    }

    public function departmentPrintModal(Request $request): ?array
    {
        if ($request->query('modal') !== 'print-department') {
            return null;
        }

        return [
            'name' => trim((string) $request->query('name', '')),
        ];
    }

    public function departmentPrintData(Request $request, int $stationId): array
    {
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);
        $search = trim((string) $request->query('search', ''));
        $selectedDepartment = trim((string) $request->query('department', ''));

        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }

        if ($year < 2000 || $year > 2100) {
            $year = now()->year;
        }

        $departments = $this->repository
            ->printDepartmentsForStation($stationId, $search, $month, $year)
            ->map(fn ($office) => [
                'id' => $office->id,
                'name' => $office->name,
                'division' => $office->division,
                'employees_count' => $office->employees_count,
            ]);

        if ($selectedDepartment === '' || ! $departments->contains('name', $selectedDepartment)) {
            $selectedDepartment = (string) ($departments->first()['name'] ?? '');
        }

        return [
            'departments' => $departments->values(),
            'selected_department' => $selectedDepartment,
            'employees' => $selectedDepartment !== ''
                ? $this->repository
                    ->printEmployeesForOffice($stationId, $selectedDepartment, $month, $year)
                    ->map(fn (Employee $employee) => $this->formatPrintEmployee($employee))
                    ->values()
                : [],
        ];
    }

    private function computeStationTardiness(int $stationId): void
    {
        $fixedAttendances = $this->repository->unprocessedAttendancesByWorkTypes(
            $stationId,
            ['Fixed', 'Work From Home'],
        );

        if ($fixedAttendances->isNotEmpty()) {
            $this->fixedService->computeForAttendances($fixedAttendances);
        }

        $fullAttendances = $this->repository->unprocessedAttendancesByWorkTypes(
            $stationId,
            ['Full'],
        );

        if ($fullAttendances->isNotEmpty()) {
            $this->fullService->computeForAttendances($fullAttendances);
        }
    }

    private function monthlyTotalsForEmployee(Employee $employee)
    {
        return $employee->attendances
            ->groupBy(fn ($attendance) => Carbon::parse($attendance->date)->format('Y-m'))
            ->map(fn ($monthGroup) => $monthGroup->sum(
                fn ($attendance) => $attendance->tardinessRecord->converted_tardy ?? 0,
            ));
    }

    private function officeHeadSignatory(Employee $employee): array
    {
        $officeHead = $this->repository->officeHeadForOffice($employee->office_id);
        $employeeIsOfficeHead = (string) $officeHead?->employee_id === (string) $employee->id;

        if ($employeeIsOfficeHead) {
            $divisionHead = $this->repository->divisionHeadForDivision(
                $employee->office?->division_id,
            );

            if (! $divisionHead?->employee) {
                return [
                    'name' => 'No Division Head Assigned',
                    'position' => 'Division Head',
                    'office' => $employee->office?->name,
                    'employee' => null,
                    'type' => 'division_head',
                    'missing' => true,
                ];
            }

            return [
                'name' => $this->formatEmployeeName($divisionHead->employee),
                'position' => $divisionHead->employee->position ?: 'Division Head',
                'office' => $employee->office?->name,
                'employee' => $this->signatoryEmployee($divisionHead->employee),
                'type' => 'division_head',
                'missing' => false,
            ];
        }

        if (! $officeHead?->employee) {
            return [
                'name' => 'No Office Head Assigned',
                'position' => 'Office Head',
                'office' => $employee->office?->name,
                'employee' => null,
                'type' => 'office_head',
                'missing' => true,
            ];
        }

        return [
            'name' => $this->formatEmployeeName($officeHead->employee),
            'position' => $officeHead->employee->position ?: 'Office Head',
            'office' => $employee->office?->name,
            'employee' => $this->signatoryEmployee($officeHead->employee),
            'type' => 'office_head',
            'missing' => false,
        ];
    }

    private function availableSignatories(Employee $employee): array
    {
        return [
            'office_head' => $this->directOfficeHeadSignatory($employee),
            'division_head' => $this->divisionHeadSignatory($employee),
        ];
    }

    private function directOfficeHeadSignatory(Employee $employee): array
    {
        $officeHead = $this->repository->officeHeadForOffice($employee->office_id);

        if (! $officeHead?->employee) {
            return [
                'name' => 'No Office Head Assigned',
                'position' => 'Office Head',
                'office' => $employee->office?->name,
                'employee' => null,
                'type' => 'office_head',
                'missing' => true,
            ];
        }

        return [
            'name' => $this->formatEmployeeName($officeHead->employee),
            'position' => $officeHead->employee->position ?: 'Office Head',
            'office' => $employee->office?->name,
            'employee' => $this->signatoryEmployee($officeHead->employee),
            'type' => 'office_head',
            'missing' => false,
        ];
    }

    private function divisionHeadSignatory(Employee $employee): array
    {
        $divisionHead = $this->repository->divisionHeadForDivision(
            $employee->office?->division_id,
        );

        if (! $divisionHead?->employee) {
            return [
                'name' => 'No Division Head Assigned',
                'position' => 'Division Head',
                'office' => $employee->office?->name,
                'employee' => null,
                'type' => 'division_head',
                'missing' => true,
            ];
        }

        return [
            'name' => $this->formatEmployeeName($divisionHead->employee),
            'position' => $divisionHead->employee->position ?: 'Division Head',
            'office' => $employee->office?->name,
            'employee' => $this->signatoryEmployee($divisionHead->employee),
            'type' => 'division_head',
            'missing' => false,
        ];
    }

    private function signatoryEmployee(Employee $employee): array
    {
        return [
            'id' => $employee->id,
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'full_name' => $this->formatEmployeeName($employee),
            'profile_img' => $employee->profile_img,
            'position' => $employee->position,
        ];
    }

    private function formatEmployeeName(?Employee $employee): string
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

    private function formatSuggestion(Employee $employee): array
    {
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
            ])->filter()->join(' - '),
            'search' => $fullName,
        ];
    }

    private function formatPrintEmployee(Employee $employee): array
    {
        return [
            'id' => $employee->id,
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'full_name' => $this->formatEmployeeName($employee),
            'profile_img' => $employee->profile_img,
            'position' => $employee->position,
            'department' => $employee->office?->name,
            'office' => $employee->office,
        ];
    }
}
