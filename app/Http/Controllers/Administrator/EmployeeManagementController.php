<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Office;
use App\Models\Administrator\Station;
use Illuminate\Http\Request;
use Inertia\Inertia;


class EmployeeManagementController extends Controller
{
    use ValidatesPassword;
    
    public function index()
    {
        $user = auth()->user();
        $stationId = $user->employee->station_id;
        $search = trim((string) request('search', ''));
        $offices = Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->orderBy('name')
            ->get();

        $employees = Employee::with('roles')
            ->get()
            ->map(function ($emp) {
                $emp->is_department_head = $emp->roles
                    ->where('type', 'department_head')
                    ->isNotEmpty();

                return $emp;
            });

        $employeesQuery = Employee::with(['biometric', 'roles', 'office.division'])
            ->withCount(['biometric'])
            ->where('station_id', $stationId);

        $employeesWithFingers = (clone $employeesQuery)
            ->get()
            ->transform(function ($emp) {

                $emp->available_fingers = 3 - $emp->biometric_count;

                $emp->is_department_head = $emp->roles
                    ->where('type', 'department_head')
                    ->isNotEmpty();

                return $emp;
            });

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

        $filteredEmployeesList = $filteredEmployeesList
            ->get()
            ->transform(function ($emp) {
                $emp->available_fingers = 3 - $emp->biometric_count;

                $emp->is_department_head = $emp->roles
                    ->where('type', 'department_head')
                    ->isNotEmpty();

                return $emp;
            });

        $registeredEmployees = $employeesWithFingers
            ->filter(fn($e) => $e->biometric_count > 0)
            ->values();

        $unregisteredEmployees = $employeesWithFingers
            ->filter(fn($e) => $e->biometric_count === 0)
            ->values();

        $stations = Station::select('id', 'name')->get();

        return Inertia::render('Admin/EmployeeManagement/EmployeeManagement', [
            'allEmployees' => $employees,
            'offices' => $offices,
            'employeesList' => $employeesWithFingers,
            'filteredEmployeesList' => $filteredEmployeesList,
            'registeredList' => $registeredEmployees,
            'unregisteredList' => $unregisteredEmployees,
            'stations' => $stations,
            'userStation' => $user->employee->station->name ?? null,
            'userStationId' => $stationId,
            'search' => $search,
        ]);
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
