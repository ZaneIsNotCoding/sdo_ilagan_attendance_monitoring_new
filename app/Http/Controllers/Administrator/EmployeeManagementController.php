<?php

namespace App\Http\Controllers\Administrator;


use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Station;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class EmployeeManagementController extends Controller
{

    public function index()
    {
        $user = auth()->user();
        $stationId = $user->employee->station_id;
        $employees = Employee::where('station_id', $stationId)->get();

        $employeesWithFingers = Employee::withCount('biometric')
            ->where('station_id', $stationId)
            ->get()
            ->transform(function ($emp) {
                $emp->available_fingers = 3 - $emp->biometric_count;
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
            'employeesList' => $employeesWithFingers,
            'registeredList' => $registeredEmployees,
            'unregisteredList' => $unregisteredEmployees,
            'stations' => $stations,
            'userStation' => $user->employee->station->name,
            'userStationId' => $stationId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'work_type' => 'required|string|max:255',
            'station_id' => 'required|exists:stations,id', 
        ]);

        Employee::create($validated);

        return redirect()->back()->with('success', 'Employee added successfully 🎉');
    }



    public function update(Request $request, $id)
    {

        $request->validate([
            'password' => 'required',
        ]);

        if (!Hash::check($request->password, auth()->user()->password)) {
            throw ValidationException::withMessages([
                'password' => 'Wrong password. Please try again.',
            ]);
        }

        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'work_type' => 'required|string|max:255',
            'active_status' => 'required|boolean',
            'station_id' => 'required|exists:stations,id',
        ]);

        $employee->update($validated);

        return back()->with('success', 'Employee updated successfully 🎉');
    }
}