<?php

namespace App\Services\Administrator\DailyTimeRecord;

use App\Data\Administrator\DailyTimeRecordListFilter\DailyTimeRecordFilter;
use App\Models\Administrator\Employee;
use App\Models\Administrator\WorkSchedule;
use App\Models\Administrator\WorkType;
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
        $filter = DailyTimeRecordFilter::fromRequest($request, $stationId);
        $this->computeStationTardiness($filter);

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
            'workTypes' => $this->repository->workTypes(),
            'workSchedules' => $this->repository->workSchedules(),
            'addWorkTypeModal' => $request->query('modal') === 'add-work-type',
            'addWorkScheduleModal' => $request->query('modal') === 'add-work-schedule',
            'editWorkTypeModal' => $this->workTypeModal($request, 'edit-work-type'),
            'deleteWorkTypeModal' => $this->workTypeModal($request, 'delete-work-type'),
            'editWorkScheduleModal' => $this->workScheduleModal($request, 'edit-work-schedule'),
            'deleteWorkScheduleModal' => $this->workScheduleModal($request, 'delete-work-schedule'),
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

    public function detailsData(int $employeeId, int $stationId): array
    {
        $timeRecord = $this->stationEmployeeTimeRecord($employeeId, $stationId);

        return [
            'time_record' => $timeRecord,
            'monthly_totals' => $this->monthlyTotalsForEmployee($timeRecord),
            'employee_leaves' => $this->repository->employeeLeaves($employeeId),
            'signatory' => $this->defaultSignatory($timeRecord),
            'signatories' => $this->availableSignatories($timeRecord),
        ];
    }

    public function storeWorkType(array $data): void
    {
        $this->repository->createWorkType($data);
    }

    public function updateWorkType(WorkType $workType, array $data): void
    {
        $this->repository->updateWorkType($workType, $data);
    }

    public function deleteWorkType(WorkType $workType): void
    {
        if ($workType->workSchedules()->exists()) {
            throw new \InvalidArgumentException(
                'This work type still has schedules. Delete its schedules first.',
            );
        }

        $this->repository->deleteWorkType($workType);
    }

    public function storeWorkSchedule(array $data): void
    {
        $this->repository->createWorkSchedule($data);
    }

    public function updateWorkSchedule(WorkSchedule $workSchedule, array $data): void
    {
        $this->repository->updateWorkSchedule($workSchedule, $data);
    }

    public function deleteWorkSchedule(WorkSchedule $workSchedule): void
    {
        $this->repository->deleteWorkSchedule($workSchedule);
    }

    public function recomputeEmployeeMonth(
        int $employeeId,
        int $stationId,
        int $month,
        int $year,
    ): void {
        if (! $this->repository->employeeForStation($employeeId, $stationId)) {
            abort(404, 'Employee not found.');
        }

        $this->repository->deleteTardinessRecordsForEmployeeMonth(
            $employeeId,
            $month,
            $year,
        );

        $attendances = $this->repository->employeeAttendancesForMonth(
            $employeeId,
            $stationId,
            $month,
            $year,
        );

        if ($attendances->isEmpty()) {
            return;
        }

        $workType = $attendances
            ->first()
            ?->employee
            ?->workSchedule
            ?->workType
            ?->name;

        if (in_array($workType, ['Fixed', 'Work From Home'], true)) {
            $this->fixedService->computeForAttendances($attendances);

            return;
        }

        if ($workType === 'Full') {
            $this->fullService->computeForAttendances($attendances);
        }
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
            (int) $request->query('month', now()->month),
            (int) $request->query('year', now()->year),
        );

        if (! $timeRecord) {
            abort(404, 'DTR preview not found.');
        }

        return [
            'name' => trim((string) $request->query('name', '')),
            'time_record' => $timeRecord,
            'monthly_totals' => $this->monthlyTotalsForEmployee($timeRecord),
            'employee_leaves' => $this->repository->employeeLeaves($employeeId),
            'signatory' => $this->defaultSignatory($timeRecord),
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
            (int) $request->query('month', now()->month),
            (int) $request->query('year', now()->year),
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
                'signatory' => $this->defaultSignatory($employee),
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

    private function workTypeModal(Request $request, string $modal): ?array
    {
        if ($request->query('modal') !== $modal) {
            return null;
        }

        $workType = $this->repository->workTypeModal((int) $request->query('work_type_id'));

        if (! $workType) {
            abort(404, 'Work type not found.');
        }

        return [
            'id' => $workType->id,
            'name' => $workType->name,
        ];
    }

    private function workScheduleModal(Request $request, string $modal): ?array
    {
        if ($request->query('modal') !== $modal) {
            return null;
        }

        $workSchedule = $this->repository->workScheduleModal((int) $request->query('work_schedule_id'));

        if (! $workSchedule) {
            abort(404, 'Work schedule not found.');
        }

        return [
            'id' => $workSchedule->id,
            'work_type_id' => $workSchedule->work_type_id,
            'work_type' => $workSchedule->workType,
            'name' => $workSchedule->name,
            'time_in' => $workSchedule->time_in,
            'time_out' => $workSchedule->time_out,
        ];
    }

    public function officePrintData(Request $request, int $stationId): array
    {
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);
        $search = trim((string) $request->query('search', ''));
        $selectedDepartment = trim((string) $request->query('department', ''));
        $employeePage = max((int) $request->query('employee_page', 1), 1);
        $employeesPerPage = 3;

        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }

        if ($year < 2000 || $year > 2100) {
            $year = now()->year;
        }

        $departments = $this->repository
            ->printOfficesForStation($stationId, $search, $month, $year)
            ->map(fn ($office) => [
                'id' => $office->id,
                'name' => $office->name,
                'division' => $office->division,
                'employees_count' => $office->employees_count,
            ]);

        if ($selectedDepartment === '' || ! $departments->contains('name', $selectedDepartment)) {
            $selectedDepartment = (string) ($departments->first()['name'] ?? '');
        }

        $employees = $selectedDepartment !== ''
            ? $this->repository
                ->printEmployeesForOffice(
                    $stationId,
                    $selectedDepartment,
                    $month,
                    $year,
                    $employeesPerPage,
                    $employeePage,
                )
                ->through(fn (Employee $employee) => $this->formatPrintEmployeeWithDetails($employee))
            : null;

        return [
            'departments' => $departments->values(),
            'selected_department' => $selectedDepartment,
            'employees' => $employees?->items() ?? [],
            'employee_pagination' => $employees ? [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'per_page' => $employees->perPage(),
                'total' => $employees->total(),
                'from' => $employees->firstItem(),
                'to' => $employees->lastItem(),
            ] : [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $employeesPerPage,
                'total' => 0,
                'from' => null,
                'to' => null,
            ],
        ];
    }

    private function computeStationTardiness(DailyTimeRecordFilter $filter): void
    {
        $fixedAttendances = $this->repository->unprocessedAttendancesByWorkTypes(
            $filter->stationId,
            ['Fixed', 'Work From Home'],
            $filter->month,
            $filter->year,
        );

        if ($fixedAttendances->isNotEmpty()) {
            $this->fixedService->computeForAttendances($fixedAttendances);
        }

        $fullAttendances = $this->repository->unprocessedAttendancesByWorkTypes(
            $filter->stationId,
            ['Full'],
            $filter->month,
            $filter->year,
        );

        if ($fullAttendances->isNotEmpty()) {
            $this->fullService->computeForAttendances($fullAttendances);
        }
    }

    private function stationEmployeeTimeRecord(int $employeeId, int $stationId): Employee
    {
        $timeRecord = $this->repository->employeeTimeRecordForStation(
            $employeeId,
            $stationId,
        );

        if (! $timeRecord) {
            abort(404, 'Daily time record not found.');
        }

        return $timeRecord;
    }

    private function monthlyTotalsForEmployee(Employee $employee)
    {
        return $employee->attendances
            ->groupBy(fn ($attendance) => Carbon::parse($attendance->date)->format('Y-m'))
            ->map(fn ($monthGroup) => $monthGroup->sum(
                fn ($attendance) => $attendance->tardinessRecord->converted_tardy ?? 0,
            ));
    }

    private function defaultSignatory(Employee $employee): array
    {
        if ($this->repository->headRoleForEmployee($employee->id, 'division_head')) {
            return $this->osdsDivisionHeadSignatory($employee);
        }

        if ($this->repository->headRoleForEmployee($employee->id, 'unit_head')) {
            return $this->divisionHeadSignatory($employee);
        }

        return $this->directOfficeHeadSignatory($employee);
    }

    private function availableSignatories(Employee $employee): array
    {
        $unitHeadRole = $this->repository->headRoleForEmployee($employee->id, 'unit_head');
        $divisionHeadRole = $this->repository->headRoleForEmployee($employee->id, 'division_head');
        $osdsHead = $this->osdsDivisionHeadSignatory($employee);

        if ($divisionHeadRole) {
            return [
                'office_head' => $osdsHead,
                'division_head' => $osdsHead,
            ];
        }

        if ($unitHeadRole) {
            $divisionHead = $this->divisionHeadSignatory($employee);

            return [
                'office_head' => $divisionHead,
                'division_head' => $divisionHead,
            ];
        }

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
                'position' => '',
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
                'position' => '',
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

    private function osdsDivisionHeadSignatory(Employee $employee): array
    {
        $osdsHead = $this->repository->osdsDivisionHeadForStation($employee->station_id);

        if (! $osdsHead?->employee) {
            return [
                'name' => 'No OSDS Head Assigned',
                'position' => '',
                'office' => 'OSDS',
                'employee' => null,
                'type' => 'office_head',
                'label' => 'OSDS Head',
                'missing' => true,
            ];
        }

        return [
            'name' => $this->formatEmployeeName($osdsHead->employee),
            'position' => $osdsHead->employee->position ?: 'OSDS Head',
            'office' => $osdsHead->division?->name ?: 'OSDS',
            'employee' => $this->signatoryEmployee($osdsHead->employee),
            'type' => 'office_head',
            'label' => 'OSDS Head',
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

    private function formatPrintEmployeeWithDetails(Employee $employee): array
    {
        return array_merge($this->formatPrintEmployee($employee), [
            'details' => [
                'time_record' => $employee,
                'monthly_totals' => $this->monthlyTotalsForEmployee($employee),
                'employee_leaves' => $this->repository->employeeLeaves($employee->id),
                'signatory' => $this->defaultSignatory($employee),
                'signatories' => $this->availableSignatories($employee),
            ],
        ]);
    }
}
