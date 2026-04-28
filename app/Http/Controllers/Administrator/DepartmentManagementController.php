<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use App\Models\Administrator\DepartmentHeadandSchoolAdmin;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;


class DepartmentManagementController extends Controller
{
    public function index()
    {
        $dept_heads = DepartmentHeadandSchoolAdmin::with([
            'employee:id,first_name,middle_name,last_name,position,department_id,work_type'
        ])
            ->where('type', 'department_head')
            ->latest()
            ->get();

        $departments = Department::select('id', 'name')->get();

        $employees = Employee::select(
            'id',
            'first_name',
            'middle_name',
            'last_name',
            'work_type',
            'position',
            'department_id',
            'station_id'
        )->get();
        
        return Inertia::render('Admin/DepartmentManagement/DepartmentManagement', [
            'dept_heads' => $dept_heads,
            'departments' => $departments,
            'employees' => $employees,
        ]);
    }

    public function storeHead(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);

        if (!$employee->department_id) {
            return back()->withErrors([
                'employee' => 'Selected employee is not assigned to any department.'
            ]);
        }

        $exists = DepartmentHeadandSchoolAdmin::where('type', 'department_head')
            ->whereHas('employee', function ($q) use ($employee) {
                $q->where('department_id', $employee->department_id);
            })
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'department' => 'This department already has a head assigned.'
            ]);
        }

        // 🚫 Prevent same employee from being assigned twice
        $alreadyAssigned = DepartmentHeadandSchoolAdmin::where('employee_id', $employee->id)
            ->where('type', 'department_head')
            ->exists();

        if ($alreadyAssigned) {
            return back()->withErrors([
                'employee' => 'This employee is already assigned as a department head.'
            ]);
        }

        // ✅ Create
        DepartmentHeadandSchoolAdmin::create([
            'employee_id' => $employee->id,
            'type' => 'department_head',
        ]);

        return back()->with('success', 'Department head added successfully!');
    }

    public function destroy(Request $request, $id)
    {
        $request->validate([
            'password' => 'required',
        ]);

        if (!Hash::check($request->password, auth()->user()->password)) {
            throw ValidationException::withMessages([
                'password' => 'Wrong password. Please try again.',
            ]);
        }

        try {
            $record = DepartmentHeadandSchoolAdmin::findOrFail($id);
            $record->delete();

            return back()->with('success', 'Deleted successfully.');
        } catch (Throwable $e) {
            return back()->with('error', 'Failed to delete.');
        }
    }

    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
        ]);

        Department::create([
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Department created successfully!');
    }

    public function updateDepartment(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $id,
        ]);

        $department = Department::findOrFail($id);
        $department->update([
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Department updated successfully!');
    }

    
    public function destroyDepartment(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        // OPTIONAL SAFETY CHECK (recommended)
        if ($department->employees()->count() > 0) {
            throw ValidationException::withMessages([
                'department' => 'Cannot delete department with assigned employees.',
            ]);
        }

        $department->delete();

        return back()->with('success', 'Department deleted successfully');
    }
}