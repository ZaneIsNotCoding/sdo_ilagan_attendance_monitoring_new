<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDepartmentHeadRequest;
use App\Models\Administrator\Employee;
use App\Models\DepartmentHead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Throwable;

class DepartmentHeadController extends Controller
    {
    public function index()
    {
        $query = DepartmentHead::with([
            'head:id,first_name,middle_name,last_name,position,department,work_type'
        ])
        ->when(request('department'), function ($q, $department) {
            $q->whereHas('head', function ($query) use ($department) {
                $query->where('department', $department);
            });
        })
        ->when(request('search'), function ($q, $search) {
            $q->whereHas('head', function ($query) use ($search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        })
        ->latest();

        $dept_heads = $query->get();

        $employees = Employee::select(
            'id',
            'first_name',
            'middle_name',
            'last_name',
            'work_type',
            'position',
            'department'
        )->get();

        $assignedDepartments = $dept_heads->pluck('head.department')->toArray();

        return Inertia::render('Admin/DepartmentHead/SchoolandDepartmentHead', [
            'dept_heads' => $dept_heads,
            'employees' => $employees,
            'assignedDepartments' => $assignedDepartments,
            'queryParams' => request()->query(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
        ]);

        $employee = Employee::findOrFail($request->employee_id);

        // 🔥 Check if this department already has a head
        $exists = DepartmentHead::whereHas('head', function ($q) use ($employee) {
            $q->where('department', $employee->department);
        })->exists();

        if ($exists) {
            return back()->withErrors([
                'department' => 'This department already has a head assigned.'
            ]);
        }

        DepartmentHead::create([
            'employee_id' => $employee->id,
        ]);

        return back()->with('success', 'Department head added successfully!');
    }

    public function destroy(Request $request, $id)
    {
        try {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);

            $deptHead = DepartmentHead::findOrFail($id);
            $deptHead->delete();

            return back()->with('success', 'Department head deleted successfully.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to delete department head.');
        }
    }
}
