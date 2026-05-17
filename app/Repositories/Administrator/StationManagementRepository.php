<?php

namespace App\Repositories\Administrator;

use App\Data\Administrator\StationManagementListFilter\StationEmployeeCandidateFilter;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use App\Models\Administrator\StationAdmin;
use App\Models\Administrator\StationAssignment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StationManagementRepository
{
    public function stationRowsPage(int $stationLimit, int $stationPage)
    {
        $stationRowsPage = DB::query()
            ->fromSub($this->stationRowsQuery(), 'station_rows')
            ->orderByRaw("CASE WHEN source = 'sdo' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->paginate($stationLimit, ['*'], 'station_page', $stationPage)
            ->withQueryString();

        $stationRowsPage->setCollection(
            $this->attachAdminsToStationRows($stationRowsPage->getCollection()),
        );

        return $stationRowsPage;
    }

    public function adminRowsPage(string $search, int $adminLimit, int $adminPage)
    {
        $adminRowsQuery = DB::query()->fromSub($this->stationRowsQuery(), 'station_rows');

        if ($search !== '') {
            $adminRowsQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $adminRowsPage = $adminRowsQuery
            ->orderByRaw("CASE WHEN source = 'sdo' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->paginate($adminLimit, ['*'], 'admin_page', $adminPage)
            ->withQueryString();

        $adminRowsPage->setCollection(
            $this->attachAdminsToStationRows($adminRowsPage->getCollection()),
        );

        return $adminRowsPage;
    }

    public function stationTotal(): int
    {
        return DB::query()
            ->fromSub($this->stationRowsQuery(), 'station_rows')
            ->count();
    }

    public function assignedStationCount(): int
    {
        return Station::query()
            ->where('code', '!=', 'SDO')
            ->whereExists(function ($query) {
                $query->selectRaw(1)
                    ->from('station_admins')
                    ->join('employees', 'employees.id', '=', 'station_admins.employee_id')
                    ->whereColumn('employees.station_id', 'stations.id')
                    ->where('station_admins.type', 'school_admin');
            })
            ->count();
    }

    public function assignedSdoCount(): int
    {
        return StationAssignment::query()
            ->whereIn('role', ['sdo_admin', 'sdo_hr'])
            ->whereExists(function ($query) {
                $query->selectRaw(1)
                    ->from('station_admins')
                    ->whereColumn('station_admins.type', 'station_assignments.role');
            })
            ->count();
    }

    public function missingPreview(int $adminLimit)
    {
        return DB::query()
            ->fromSub($this->missingStationRowsQuery(), 'station_rows')
            ->orderByRaw("CASE WHEN source = 'sdo' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->limit(6)
            ->get()
            ->map(fn ($station) => array_merge(
                $this->formatStationRow($station),
                ['admin_page' => $this->stationAdminPageForRow($station, $adminLimit)],
            ))
            ->values();
    }

    public function stationSuggestions(string $search)
    {
        if ($search === '') {
            return collect();
        }

        $sdo = StationAssignment::whereIn('role', ['sdo_admin', 'sdo_hr'])
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->limit(8)
            ->get()
            ->map(fn ($item) => [
                'id' => 'sdo-' . $item->role,
                'record_id' => $item->id,
                'code' => $item->code,
                'name' => $item->name,
                'source' => 'sdo',
                'role' => $item->role,
            ]);

        $remaining = 8 - $sdo->count();
        $stations = collect();

        if ($remaining > 0) {
            $stations = Station::where('code', '!=', 'SDO')
                ->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                })
                ->orderBy('name')
                ->limit($remaining)
                ->get()
                ->map(fn ($station) => [
                    'id' => $station->id,
                    'record_id' => null,
                    'code' => $station->code,
                    'name' => $station->name,
                    'source' => 'station',
                    'role' => null,
                ]);
        }

        return collect($sdo->all())
            ->merge($stations->all())
            ->values();
    }

    public function employeeCandidates(StationEmployeeCandidateFilter $filter): array
    {
        $employeesQuery = Employee::with([
            'user:id,employee_id,email,created_at',
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
            ->where(function ($query) use ($filter) {
                $query->whereNull('station_id')
                    ->orWhere('station_id', $filter->stationId);
            })
            ->when($filter->search !== '', function ($query) use ($filter) {
                $query->where(function ($query) use ($filter) {
                    $query->where('first_name', 'like', "%{$filter->search}%")
                        ->orWhere('middle_name', 'like', "%{$filter->search}%")
                        ->orWhere('last_name', 'like', "%{$filter->search}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$filter->search}%"])
                        ->orWhere('position', 'like', "%{$filter->search}%");
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name');

        $total = (clone $employeesQuery)->count();

        return [
            'data' => $employeesQuery->limit(5)->get(),
            'total' => $total,
        ];
    }

    public function assignStationModal(int|string|null $stationId, string $role, string $source): ?array
    {
        if (! in_array($role, ['school_admin', 'sdo_admin', 'sdo_hr'], true)) {
            return null;
        }

        if ($source === 'sdo') {
            $assignment = StationAssignment::query()
                ->where('station_id', $stationId)
                ->where('role', $role)
                ->first();

            return $assignment ? $this->formatStationAssignmentModal($assignment) : null;
        }

        $station = Station::query()
            ->where('code', '!=', 'SDO')
            ->find($stationId);

        return $station ? $this->formatStationModal($station) : null;
    }

    public function stationActionModal(int|string|null $stationId, ?string $role, string $source): ?array
    {
        if ($source === 'sdo') {
            $assignment = StationAssignment::query()
                ->where('station_id', $stationId)
                ->when($role, fn ($query) => $query->where('role', $role))
                ->first();

            return $assignment ? $this->formatStationAssignmentModal($assignment) : null;
        }

        $station = Station::query()
            ->where('code', '!=', 'SDO')
            ->find($stationId);

        return $station ? $this->formatStationModal($station) : null;
    }

    public function stationAdminForRemove(int|string|null $adminId): ?StationAdmin
    {
        return StationAdmin::with([
            'employee:id,first_name,middle_name,last_name,position',
        ])->find($adminId);
    }

    public function findEmployeeOrFail(int $id): Employee
    {
        return Employee::findOrFail($id);
    }

    public function findStationAdminOrFail(int $id): StationAdmin
    {
        return StationAdmin::findOrFail($id);
    }

    public function userByEmployeeId(int $employeeId): ?User
    {
        return User::where('employee_id', $employeeId)->first();
    }

    public function updateOrCreateUser(int $employeeId, string $email, string $password): User
    {
        return User::updateOrCreate(
            ['employee_id' => $employeeId],
            [
                'email' => $email,
                'password' => $password,
            ],
        );
    }

    public function firstOrCreateStationAdmin(int $employeeId, string $type): StationAdmin
    {
        return StationAdmin::firstOrCreate([
            'employee_id' => $employeeId,
            'type' => $type,
        ]);
    }

    public function createStation(array $data): Station
    {
        return Station::create([
            'code' => $data['code'] ?? null,
            'name' => $data['name'],
        ]);
    }

    private function stationRowsQuery()
    {
        $sdo = StationAssignment::query()
            ->whereIn('role', ['sdo_admin', 'sdo_hr'])
            ->selectRaw("
                CONCAT('sdo-', role) as id,
                id as record_id,
                station_id,
                code,
                name,
                'sdo' as source,
                role
            ");

        $stations = Station::query()
            ->where('code', '!=', 'SDO')
            ->selectRaw("
                CAST(id AS CHAR) as id,
                NULL as record_id,
                id as station_id,
                code,
                name,
                'station' as source,
                NULL as role
            ");

        return $sdo->unionAll($stations);
    }

    private function missingStationRowsQuery()
    {
        $sdo = StationAssignment::query()
            ->whereIn('role', ['sdo_admin', 'sdo_hr'])
            ->whereNotExists(function ($query) {
                $query->selectRaw(1)
                    ->from('station_admins')
                    ->whereColumn('station_admins.type', 'station_assignments.role');
            })
            ->selectRaw("
                CONCAT('sdo-', role) as id,
                id as record_id,
                station_id,
                code,
                name,
                'sdo' as source,
                role
            ");

        $stations = Station::query()
            ->where('code', '!=', 'SDO')
            ->whereNotExists(function ($query) {
                $query->selectRaw(1)
                    ->from('station_admins')
                    ->join('employees', 'employees.id', '=', 'station_admins.employee_id')
                    ->whereColumn('employees.station_id', 'stations.id')
                    ->where('station_admins.type', 'school_admin');
            })
            ->selectRaw("
                CAST(id AS CHAR) as id,
                NULL as record_id,
                id as station_id,
                code,
                name,
                'station' as source,
                NULL as role
            ");

        return $sdo->unionAll($stations);
    }

    private function attachAdminsToStationRows($rows)
    {
        if ($rows->isEmpty()) {
            return $rows;
        }

        $stationIds = $rows
            ->where('source', 'station')
            ->pluck('station_id')
            ->filter()
            ->unique()
            ->values();

        $sdoRoles = $rows
            ->where('source', 'sdo')
            ->pluck('role')
            ->filter()
            ->unique()
            ->values();

        $admins = StationAdmin::with([
            'employee:id,first_name,middle_name,last_name,profile_img,position,office_id,work_schedule_id,station_id',
            'employee.workSchedule.workType:id,name',
            'employee.user:id,employee_id,email,created_at',
        ])
            ->where(function ($query) use ($stationIds, $sdoRoles) {
                if ($stationIds->isNotEmpty()) {
                    $query->orWhere(function ($query) use ($stationIds) {
                        $query->where('type', 'school_admin')
                            ->whereHas('employee', function ($query) use ($stationIds) {
                                $query->whereIn('station_id', $stationIds);
                            });
                    });
                }

                if ($sdoRoles->isNotEmpty()) {
                    $query->orWhereIn('type', $sdoRoles);
                }
            })
            ->latest()
            ->get();

        $schoolAdminsByStation = $admins
            ->where('type', 'school_admin')
            ->filter(fn ($admin) => $admin->employee?->station_id)
            ->groupBy(fn ($admin) => (string) $admin->employee->station_id)
            ->map(fn ($admins) => $admins->first());

        $sdoAdminsByRole = $admins
            ->whereIn('type', ['sdo_admin', 'sdo_hr'])
            ->groupBy('type')
            ->map(fn ($admins) => $admins->first());

        return $rows
            ->map(function ($row) use ($schoolAdminsByStation, $sdoAdminsByRole) {
                $admin = $row->source === 'station'
                    ? $schoolAdminsByStation->get((string) $row->station_id)
                    : $sdoAdminsByRole->get($row->role);

                return [
                    'station' => $this->formatStationRow($row),
                    'admin' => $admin,
                ];
            })
            ->values();
    }

    private function formatStationRow($row): array
    {
        $station = [
            'id' => $row->source === 'sdo' ? 'sdo-' . $row->role : $row->station_id,
            'code' => $row->code,
            'name' => $row->name,
            'source' => $row->source,
        ];

        if ($row->source === 'sdo') {
            $station['record_id'] = $row->record_id;
            $station['station_id'] = $row->station_id;
            $station['role'] = $row->role;
        }

        return $station;
    }

    private function stationAdminPageForRow($row, int $perPage): int
    {
        $sdoCount = StationAssignment::query()
            ->whereIn('role', ['sdo_admin', 'sdo_hr'])
            ->count();

        if ($row->source === 'sdo') {
            $before = StationAssignment::query()
                ->whereIn('role', ['sdo_admin', 'sdo_hr'])
                ->where('name', '<', $row->name)
                ->count();

            return (int) floor($before / $perPage) + 1;
        }

        $before = $sdoCount + Station::query()
            ->where('code', '!=', 'SDO')
            ->where('name', '<', $row->name)
            ->count();

        return (int) floor($before / $perPage) + 1;
    }

    private function formatStationAssignmentModal(StationAssignment $assignment): array
    {
        return [
            'id' => 'sdo-' . $assignment->role,
            'record_id' => $assignment->id,
            'station_id' => $assignment->station_id,
            'role' => $assignment->role,
            'source' => 'sdo',
            'name' => $assignment->name,
            'code' => $assignment->code,
        ];
    }

    private function formatStationModal(Station $station): array
    {
        return [
            'id' => $station->id,
            'station_id' => $station->id,
            'role' => 'school_admin',
            'source' => 'station',
            'name' => $station->name,
            'code' => $station->code,
        ];
    }
}
