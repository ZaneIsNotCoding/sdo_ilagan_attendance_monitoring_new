<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use App\Models\Administrator\StationAdmin;
use App\Models\Administrator\StationAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Concerns\HandleModalConcerns\StationModals;
use App\Http\Controllers\Concerns\ValidatesPassword;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StationManagementController extends Controller
{
    use StationModals;
    use ValidatesPassword;
    
    public function index()
    {
        $search = trim((string) request('search', ''));
        $stationPage = max((int) request('station_page', 1), 1);
        $adminPage = max((int) request('admin_page', 1), 1);
        $stationLimit = (int) request('station_limit', 5);
        $adminLimit = (int) request('admin_limit', 10);

        if (! in_array($stationLimit, [5, 10, 25, 50], true)) {
            $stationLimit = 5;
        }

        if (! in_array($adminLimit, [10, 25, 50, 100], true)) {
            $adminLimit = 10;
        }

        if (
            (string) request('station_limit') !== (string) $stationLimit ||
            (string) request('admin_limit') !== (string) $adminLimit
        ) {
            return redirect()->to(request()->fullUrlWithQuery([
                'station_limit' => $stationLimit,
                'admin_limit' => $adminLimit,
            ]));
        }

        $stationRowsQuery = $this->stationRowsQuery();

        $stationRowsPage = DB::query()
            ->fromSub($stationRowsQuery, 'station_rows')
            ->orderByRaw("CASE WHEN source = 'sdo' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->paginate($stationLimit, ['*'], 'station_page', $stationPage)
            ->withQueryString();

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

        $stationRowsPage->setCollection($this->attachAdminsToStationRows($stationRowsPage->getCollection()));
        $adminRowsPage->setCollection($this->attachAdminsToStationRows($adminRowsPage->getCollection()));

        $stationTotal = DB::query()
            ->fromSub($this->stationRowsQuery(), 'station_rows')
            ->count();

        $assignedStationCount = Station::query()
            ->where('code', '!=', 'SDO')
            ->whereExists(function ($query) {
                $query->selectRaw(1)
                    ->from('station_admins')
                    ->join('employees', 'employees.id', '=', 'station_admins.employee_id')
                    ->whereColumn('employees.station_id', 'stations.id')
                    ->where('station_admins.type', 'school_admin');
            })
            ->count();

        $assignedSdoCount = StationAssignment::query()
            ->whereIn('role', ['sdo_admin', 'sdo_hr'])
            ->whereExists(function ($query) {
                $query->selectRaw(1)
                    ->from('station_admins')
                    ->whereColumn('station_admins.type', 'station_assignments.role');
            })
            ->count();

        $missingPreview = DB::query()
            ->fromSub($this->missingStationRowsQuery(), 'station_rows')
            ->orderByRaw("CASE WHEN source = 'sdo' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->limit(6)
            ->get()
            ->map(function ($station) use ($adminLimit) {
                return array_merge(
                    $this->formatStationRow($station),
                    [
                        'admin_page' => $this->stationAdminPageForRow(
                            $station,
                            $adminLimit,
                        ),
                    ],
                );
            })
            ->values();

        $stationStats = [
            'total' => $stationTotal,
            'assigned' => $assignedStationCount + $assignedSdoCount,
            'missing' => $stationTotal - ($assignedStationCount + $assignedSdoCount),
            'missing_preview' => $missingPreview,
        ];

        return Inertia::render('Admin/StationManagement/StationManagement', [
            'stations' => $stationRowsPage,
            'stationAdminRows' => $adminRowsPage,
            'stationStats' => $stationStats,
            'assignStationModal' => $this->resolveAssignStationModal(),
            'editStationModal' => $this->resolveStationActionModal('edit-station'),
            'deleteStationModal' => $this->resolveStationActionModal('delete-station'),
            'removeStationAdminModal' => $this->resolveRemoveStationAdminModal(),
            'search' => $search,
            'stationPage' => $stationPage,
            'adminPage' => $adminPage,
            'stationLimit' => $stationLimit,
            'adminLimit' => $adminLimit,
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
            'employee:id,first_name,middle_name,last_name,profile_img,position,office_id,work_type,station_id',
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

    public function suggestions(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        if ($search === '') {
            return response()->json([]);
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

        return response()->json(
            collect($sdo->all())
                ->merge($stations->all())
                ->values(),
        );
    }

    public function adminEmployeeCandidates(Request $request)
    {
        $validated = $request->validate([
            'station_id' => ['required', 'integer', 'exists:stations,id'],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $search = trim((string) ($validated['search'] ?? ''));
        $stationId = $validated['station_id'];

        return Employee::with('user:id,employee_id,email,created_at')
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'work_type',
                'position',
                'office_id',
                'station_id',
            )
            ->where(function ($query) use ($stationId) {
                $query->whereNull('station_id')
                    ->orWhere('station_id', $stationId);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$search}%"])
                        ->orWhere('position', 'like', "%{$search}%");
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(5 )
            ->get();
    }

    public function destroy(Request $request, $id)
    {
        $this->ensureValidPassword($request);

        $record = StationAdmin::findOrFail($id);

        $user = User::where('employee_id', $record->employee_id)->first();

        if ($user) {
            $user->delete();
        }

        $record->delete();

        return back()->with('success', 'Station admin removed successfully.');
    }

    public function store(Request $request)
    {
        $employee = Employee::findOrFail($request->employee_id);
        $existingUser = User::where('employee_id', $employee->id)->first();

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'station_id' => 'required|exists:stations,id',
            'role' => 'required|in:school_admin,sdo_admin,sdo_hr',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($existingUser?->id),
            ],
            'password' => [
                'required',
                'string',
                'min:6',
                'confirmed',
                'regex:/[A-Z]/',
                'regex:/\d/',
            ],
        ]);

        $employee->update([
            'station_id' => $validated['station_id'],
        ]);

        User::updateOrCreate(
            ['employee_id' => $employee->id],
            [
                'email' => $validated['email'],
                'password' => $validated['password'],
            ],
        )->syncRoles([$validated['role']]);

        StationAdmin::firstOrCreate([
            'employee_id' => $employee->id,
            'type' => $validated['role'],
        ]);

        return back()->with('success', 'Station admin assigned successfully.');
    }

    public function storeStation(Request $request)
    {
        $validated = $request->validate([
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('stations', 'code'),
            ],
            'name' => 'required|string|max:255',
        ]);

        Station::create([
            'code' => $validated['code'] ?? null,
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Station added successfully.');
    }

    public function updateStation(Request $request, Station $station)
    {
        $validated = $request->validate([
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('stations', 'code')->ignore($station->id),
            ],
            'name' => 'required|string|max:255',
            'password' => 'required',
        ]);

        $this->ensureValidPassword($request);

        $station->update([
            'code' => $validated['code'],
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Station updated successfully.');
    }

    public function destroyStation(Request $request, Station $station)
    {
        $this->ensureValidPassword($request);

        $station->delete();

        return back()->with('success', 'Station deleted successfully.');
    }

    public function updateStationAssignment(Request $request, StationAssignment $stationAssignment)
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('station_assignments', 'code')->ignore($stationAssignment->id),
            ],
            'name' => 'required|string|max:255',
            'password' => 'required',
        ]);

        $this->ensureValidPassword($request);

        $stationAssignment->update([
            'code' => $validated['code'],
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'SDO Station updated successfully.');
    }

    public function destroyStationAssignment(Request $request, StationAssignment $stationAssignment)
    {
        
        $this->ensureValidPassword($request);

        $stationAssignment->delete();

        return back()->with('success', 'SDO Station deleted successfully.');
    }

}
