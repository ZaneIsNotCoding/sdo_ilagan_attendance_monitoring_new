<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Station;
use App\Models\DepartmentHead;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Throwable;

class DepartmentHeadController extends Controller
{
public function index()
    {
        $dept_heads = DepartmentHead::with([
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

        $assignedDepartments = $dept_heads
            ->map(fn ($h) => $h->employee?->department_id)
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        return Inertia::render('Admin/DepartmentHead/DepartmentHead', [
            'dept_heads' => $dept_heads,
            'departments' => $departments,
            'employees' => $employees,
            'assignedDepartments' => $assignedDepartments,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
        ]);

        $employee = Employee::findOrFail($request->employee_id);

        $exists = DepartmentHead::where('type', 'department_head')
            ->whereHas('employee', function ($q) use ($employee) {
                $q->where('department_id', $employee->department_id);
            })
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'department' => 'This department already has a head assigned.'
            ]);
        }

        DepartmentHead::create([
            'employee_id' => $employee->id,
            'type' => 'department_head',
        ]);

        return back()->with('success', 'Department head added successfully!');
    }

    public function destroy(Request $request, $id)
    {
        try {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);

            $record = DepartmentHead::findOrFail($id);
            $record->delete();

            return back()->with('success', 'Deleted successfully.');
        } catch (Throwable $e) {
            return back()->with('error', 'Failed to delete.');
        }
    }
}