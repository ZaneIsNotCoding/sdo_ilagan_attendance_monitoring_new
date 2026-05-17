<?php

namespace App\Services\Administrator;

use App\Data\Administrator\StationManagementListFilter\StationEmployeeCandidateFilter;
use App\Data\Administrator\StationManagementListFilter\StationPageFilter;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use App\Models\Administrator\StationAssignment;
use App\Repositories\Administrator\StationManagementRepository;
use Illuminate\Http\Request;

class StationManagementService
{
    public function __construct(
        private readonly StationManagementRepository $repository,
    ) {}

    public function pageData(Request $request, StationPageFilter $filter): array
    {
        return [
            'stations' => $this->repository->stationRowsPage(
                $filter->stationLimit,
                $filter->stationPage,
            ),
            'stationAdminRows' => $this->repository->adminRowsPage(
                $filter->search,
                $filter->adminLimit,
                $filter->adminPage,
            ),
            'stationStats' => $this->stationStats($filter->adminLimit),
            'addStationModal' => $request->query('modal') === 'add-station',
            'assignStationModal' => $this->assignStationModal($request),
            'editStationModal' => $this->stationActionModal($request, 'edit-station'),
            'deleteStationModal' => $this->stationActionModal($request, 'delete-station'),
            'removeStationAdminModal' => $this->removeStationAdminModal($request),
            'search' => $filter->search,
            'stationPage' => $filter->stationPage,
            'adminPage' => $filter->adminPage,
            'stationLimit' => $filter->stationLimit,
            'adminLimit' => $filter->adminLimit,
        ];
    }

    public function adminRows(StationPageFilter $filter): array
    {
        return [
            'stationAdminRows' => $this->repository->adminRowsPage(
                $filter->search,
                $filter->adminLimit,
                $filter->adminPage,
            ),
            'search' => $filter->search,
            'adminPage' => $filter->adminPage,
            'adminLimit' => $filter->adminLimit,
        ];
    }

    public function stationRows(StationPageFilter $filter): array
    {
        return [
            'stations' => $this->repository->stationRowsPage(
                $filter->stationLimit,
                $filter->stationPage,
            ),
            'stationPage' => $filter->stationPage,
            'stationLimit' => $filter->stationLimit,
        ];
    }

    public function suggestions(Request $request): array
    {
        $search = trim((string) $request->query('search', ''));

        return $this->repository
            ->stationSuggestions($search)
            ->all();
    }

    public function employeeCandidates(StationEmployeeCandidateFilter $filter): array
    {
        return $this->repository->employeeCandidates($filter);
    }

    public function assignAdmin(array $validated): void
    {
        $employee = $this->repository->findEmployeeOrFail((int) $validated['employee_id']);

        $employee->update([
            'station_id' => $validated['station_id'],
        ]);

        $this->repository
            ->updateOrCreateUser(
                $employee->id,
                $validated['email'],
                $validated['password'],
            )
            ->syncRoles([$validated['role']]);

        $this->repository->firstOrCreateStationAdmin(
            $employee->id,
            $validated['role'],
        );
    }

    public function deleteAdmin(int $id): void
    {
        $record = $this->repository->findStationAdminOrFail($id);
        $user = $this->repository->userByEmployeeId($record->employee_id);

        if ($user) {
            $user->delete();
        }

        $record->delete();
    }

    public function storeStation(array $validated): Station
    {
        return $this->repository->createStation($validated);
    }

    public function updateStation(Station $station, array $validated): void
    {
        $station->update([
            'code' => $validated['code'] ?? null,
            'name' => $validated['name'],
        ]);
    }

    public function deleteStation(Station $station): void
    {
        $station->delete();
    }

    public function updateStationAssignment(
        StationAssignment $stationAssignment,
        array $validated,
    ): void {
        $stationAssignment->update([
            'code' => $validated['code'],
            'name' => $validated['name'],
        ]);
    }

    public function deleteStationAssignment(StationAssignment $stationAssignment): void
    {
        $stationAssignment->delete();
    }

    private function stationStats(int $adminLimit): array
    {
        $stationTotal = $this->repository->stationTotal();
        $assignedCount = $this->repository->assignedStationCount() +
            $this->repository->assignedSdoCount();

        return [
            'total' => $stationTotal,
            'assigned' => $assignedCount,
            'missing' => $stationTotal - $assignedCount,
            'missing_preview' => $this->repository->missingPreview($adminLimit),
        ];
    }

    private function assignStationModal(Request $request): ?array
    {
        if ($request->query('modal') !== 'station-admin') {
            return null;
        }

        return $this->repository->assignStationModal(
            $request->query('station_id'),
            (string) $request->query('station_role', 'school_admin'),
            (string) $request->query('station_source', 'station'),
        );
    }

    private function stationActionModal(Request $request, string $modal): ?array
    {
        if ($request->query('modal') !== $modal) {
            return null;
        }

        return $this->repository->stationActionModal(
            $request->query('station_id'),
            $request->query('station_role'),
            (string) $request->query('station_source', 'station'),
        );
    }

    private function removeStationAdminModal(Request $request): ?array
    {
        if ($request->query('modal') !== 'remove-station-admin') {
            return null;
        }

        $admin = $this->repository->stationAdminForRemove($request->query('admin_id'));

        if (! $admin) {
            return null;
        }

        return [
            'id' => $admin->id,
            'employee_name' => $this->formatEmployeeName($admin->employee),
        ];
    }

    private function formatEmployeeName(?Employee $employee): string
    {
        if (! $employee) {
            return 'Station Admin';
        }

        $name = preg_replace(
            '/\s+/',
            ' ',
            trim("{$employee->first_name} {$employee->middle_name} {$employee->last_name}"),
        );

        return $name !== '' ? $name : 'Station Admin';
    }
}
