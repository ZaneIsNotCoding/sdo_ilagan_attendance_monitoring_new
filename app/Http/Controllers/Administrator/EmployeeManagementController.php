<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Concerns\HandleModalConcerns\EmployeeModals;
use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Office;
use App\Models\Administrator\Station;
use Illuminate\Http\Request;
use Inertia\Inertia;


class EmployeeManagementController extends Controller
{
    use EmployeeModals;
    use ValidatesPassword;
    
    public function index()
    {
        $user = auth()->user();
        $stationId = $user->employee->station_id;
        $search = trim((string) request('search', ''));
        $status = request('status', 'Active');
        $officeName = trim((string) request('office', 'all'));
        $officeId = 'all';
        $limit = (int) request('limit', 10);

        if (! in_array($status, ['Active', 'Inactive'], true)) {
            $status = 'Active';
        }

        if (! in_array($limit, [10, 25, 50, 100], true)) {
            $limit = 10;
        }

        if ((string) request('limit') !== (string) $limit) {
            return redirect()->to(request()->fullUrlWithQuery([
                'limit' => $limit,
            ]));
        }

        $offices = Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->orderBy('name')
            ->get();

        if ($officeName !== '' && $officeName !== 'all') {
            $officeId = $offices
                ->firstWhere('name', $officeName)
                ?->id ?? 'all';
        }

        $employeesQuery = Employee::with(['biometric', 'roles', 'office.division'])
            ->withCount(['biometric'])
            ->where('station_id', $stationId);

        $appendEmployeeMeta = function ($emp) {
            $emp->available_fingers = 3 - $emp->biometric_count;

            $emp->is_department_head = $emp->roles
                ->where('type', 'department_head')
                ->isNotEmpty();

            return $emp;
        };

        $filteredEmployeesList = (clone $employeesQuery);

        if ($search !== '') {
            $filteredEmployeesList->where(function ($query) use ($search) {
                $query->where('id', $search)
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhereRaw(
                        "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                        ["%{$search}%"],
                    )
                    ->orWhereRaw(
                        "CONCAT_WS(' ', id, first_name, middle_name, last_name) LIKE ?",
                        ["%{$search}%"],
                    );
            });
        }

        if ($officeId !== 'all') {
            $filteredEmployeesList->where('office_id', (int) $officeId);
        }

        $filteredEmployeesList->where(
            'active_status',
            $status === 'Active' ? 1 : 0,
        );

        $filteredEmployeesList
            ->orderBy('first_name')
            ->orderBy('middle_name')
            ->orderBy('last_name')
            ->orderBy('id');

        $filteredEmployeesList = $filteredEmployeesList
            ->paginate($limit)
            ->withQueryString()
            ->through($appendEmployeeMeta);

        $stations = Station::select('id', 'name')->get();

        return Inertia::render('Admin/EmployeeManagement/EmployeeManagement', [
            'offices' => $offices,
            'filteredEmployeesList' => $filteredEmployeesList,
            'stations' => $stations,
            'selectedFingerprintEmployee' => $this->resolveFingerprintEmployee($stationId),
            'userStation' => $user->employee->station->name ?? null,
            'userStationId' => $stationId,
            'search' => $search,
            'status' => $status,
            'officeName' => $officeId === 'all' ? 'all' : $officeName,
            'limit' => $limit,
            'editEmployeeModal' => $this->resolveEmployeeActionModal('edit-employee'),
            'testFingerprintModal' => $this->resolveTestFingerprintModal(),
        ]);
    }

    public function suggestions(Request $request)
    {
        $user = auth()->user();
        $stationId = $user->employee->station_id;
        $search = trim((string) $request->query('search', ''));

        $employees = Employee::with('office.division:id,code,name')
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
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('id', $search)
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        )
                        ->orWhereRaw(
                            "CONCAT_WS(' ', id, first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        );
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(10)
            ->get()
            ->map(fn ($employee) => $this->formatFingerprintEmployee($employee));

        return response()->json($employees);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'profile_img' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'position' => 'required|string|max:255',
            'office_id' => 'nullable|exists:offices,id',
            'work_type' => 'required|string|max:255',
            'station_id' => 'required|exists:stations,id',
        ]);

        if ($request->hasFile('profile_img')) {
            $validated['profile_img'] = $request->file('profile_img')->store(
                'employee-profile-images',
                'public',
            );
        }

        Employee::create($validated);

        $fullName = trim(
            preg_replace(
                '/\s+/',
                ' ',
                implode(' ', [
                    $validated['first_name'] ?? '',
                    $validated['middle_name'] ?? '',
                    $validated['last_name'] ?? '',
                ]),
            ),
        );

        return redirect()->back()->with(
            'success',
            "Employee {$fullName} added successfully!",
        );
    }

    public function update(Request $request, $id)
    {
        $this->ensureValidPassword($request);

        $request->validate([
            'password' => 'required',
        ]);
        
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'office_id' => 'nullable|exists:offices,id',
            'work_type' => 'required|string|max:255',
            'active_status' => 'required|boolean',
            'station_id' => 'required|exists:stations,id',
        ]);

        $employee->update($validated);

        return back()->with('success', 'Employee updated successfully 🎉');
    }
}
