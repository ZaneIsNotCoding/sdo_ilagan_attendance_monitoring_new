<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use App\Models\Administrator\StationAdmin;
use App\Models\Administrator\StationAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Concerns\ValidatesPassword;
use Inertia\Inertia;

class StationManagementController extends Controller
{
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

        $school_admins = StationAdmin::with([
            'employee:id,first_name,middle_name,last_name,profile_img,position,office_id,work_type,station_id',
            'employee.user:id,employee_id,email,created_at',
        ])
            ->whereIn('type', ['school_admin', 'sdo_admin', 'sdo_hr'])
            ->latest()
            ->get();

        $stations = Station::where('code', '!=', 'SDO')
            ->select('id', 'name', 'code')
            ->get()
            ->map(function ($station) {
                return [
                    'id' => $station->id,
                    'code' => $station->code,
                    'name' => $station->name,
                    'source' => 'station',
                ];
            });

        $sdo = StationAssignment::whereIn('role', ['sdo_admin', 'sdo_hr'])
            ->get()
            ->map(function ($item) {
                return [
                    'id' => 'sdo-' . $item->role,
                    'record_id' => $item->id,
                    'station_id' => $item->station_id,
                    'code' => $item->code,
                    'name' => $item->name,
                    'source' => 'sdo',
                    'role' => $item->role,
                ];
            });

        $stations = collect($sdo->all())->merge($stations->all())->values();

        $stationRows = $stations->map(function ($station) use ($school_admins) {
            $admin = null;

            if ($station['source'] === 'station') {
                $admin = $school_admins->first(
                    fn ($item) =>
                        (string) $item->employee?->station_id === (string) $station['id'] &&
                        $item->type === 'school_admin',
                );
            }

            if ($station['source'] === 'sdo') {
                $admin = $school_admins->first(
                    fn ($item) => $item->type === $station['role'],
                );
            }

            return [
                'station' => $station,
                'admin' => $admin,
            ];
        });

        $adminRows = $stationRows;

        if ($search !== '') {
            $searchLower = mb_strtolower($search);

            $adminRows = $adminRows->filter(function ($row) use ($searchLower) {
                return str_contains(mb_strtolower($row['station']['name'] ?? ''), $searchLower) ||
                    str_contains(mb_strtolower($row['station']['code'] ?? ''), $searchLower);
            })->values();
        }

        $paginateCollection = function ($items, $perPage, $page, $pageName) {
            $lastPage = (int) max(1, ceil($items->count() / $perPage));
            $page = min($page, $lastPage);
            $pageItems = $items
                ->slice(($page - 1) * $perPage, $perPage)
                ->values();

            return new LengthAwarePaginator(
                $pageItems,
                $items->count(),
                $perPage,
                $page,
                [
                    'path' => request()->url(),
                    'pageName' => $pageName,
                    'query' => request()->query(),
                ],
            );
        };

        $stationRowsPage = $paginateCollection(
            $stationRows,
            $stationLimit,
            $stationPage,
            'station_page',
        );

        $adminRowsPage = $paginateCollection(
            $adminRows,
            $adminLimit,
            $adminPage,
            'admin_page',
        );

        $missingStations = $stationRows
            ->filter(fn ($row) => ! $row['admin'])
            ->values();

        $stationStats = [
            'total' => $stationRows->count(),
            'assigned' => $stationRows->count() - $missingStations->count(),
            'missing' => $missingStations->count(),
            'missing_preview' => $missingStations
                ->take(6)
                ->map(fn ($row) => $row['station'])
                ->values(),
        ];

        $employees = Employee::with('user:id,employee_id,email,created_at')
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
            ->get();

        return Inertia::render('Admin/StationManagement/StationManagement', [
            'stations' => $stationRowsPage,
            'stationAdminRows' => $adminRowsPage,
            'stationStats' => $stationStats,
            'employees' => $employees,
            'search' => $search,
            'stationPage' => $stationPage,
            'adminPage' => $adminPage,
            'stationLimit' => $stationLimit,
            'adminLimit' => $adminLimit,
        ]);
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
