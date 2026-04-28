<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Administrator\DepartmentHeadandSchoolAdmin;
use App\Models\Administrator\Station;
use App\Models\Administrator\Employee;
use Inertia\Inertia;

class StationManagementController extends Controller
{
   public function index()
    {
        $school_admins = DepartmentHeadandSchoolAdmin::with([
            'employee:id,first_name,middle_name,last_name,position,department_id,work_type,station_id',
            'employee.user:id,employee_id,email'
        ])
            ->where('type', 'school_admin')
            ->latest()
            ->get();

        $stations = Station::select('id', 'name', 'code')->get();

        $employees = Employee::with('user:id,employee_id,email')
        ->select(
            'id',
            'first_name',
            'middle_name',
            'last_name',
            'work_type',
            'position',
            'department_id',
            'station_id'
        )->get();

        return Inertia::render('Admin/StationManagement/StationManagement', [
            'school_admins' => $school_admins,
            'stations' => $stations,
            'employees' => $employees,
        ]);
    }
    public function destroy($id)
    {
        $record = DepartmentHeadandSchoolAdmin::findOrFail($id);
        $record->delete();

        return redirect()->back()->with('success', 'School admin removed successfully.');
    }
}