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
            $q->where('department', $department);
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
            'position'
        )->get();

        return Inertia::render('Admin/DepartmentHead/SchoolandDepartmentHead', [
            'dept_heads' => $dept_heads,
            'employees' => $employees,
            'queryParams' => request()->query(),
        ]);
    }

    public function store(StoreDepartmentHeadRequest $request)
    {
        try {

            DB::beginTransaction();

            $data = $request->validated();

            $exists = DepartmentHead::where('department', $data['department'])
                ->where('status', 'active')
                ->exists();

            if ($exists && $data['status'] === 'active') {
                throw new \Exception('This department already has an active head.');
            }

            DepartmentHead::create($data);

            DB::commit();

            return redirect()
                ->route('departmenthead')
                ->with('success', 'Department head created successfully.');
        } catch (Throwable $e) {

            DB::rollBack();

            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
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
