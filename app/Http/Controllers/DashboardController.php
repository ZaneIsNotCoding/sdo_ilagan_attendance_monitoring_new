<?php

namespace App\Http\Controllers;

use App\Models\Administrator\Employee;
use App\Models\Administrator\Attendance;
use App\Models\EmployeeLeave;
use App\Models\Station;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
     public function dashboard()
    {
        $today = Carbon::today();

        // =========================
        // ATTENDANCES
        // =========================
        $attendances = Attendance::with([
            'employee.station',
            'am',
            'pm'
        ])
        ->whereDate('date', $today)
        ->latest()
        ->get();

        // =========================
        // LEAVES (GROUPED CORRECTLY)
        // =========================
        $leaves = EmployeeLeave::whereDate('date', $today)
        ->get();

        // =========================
        // EMPLOYEES + LEAVE MERGE
        // =========================
        $employees = Employee::with('station')
            ->get()
            ->map(function ($emp) use ($leaves) {

                $leaveType = optional($leaves[$emp->id] ?? collect())
                    ->first()
                    ?->leave_type;

                return [
                    'id' => $emp->id,
                    'employee_id' => $emp->id,
                    'first_name' => $emp->first_name,
                    'middle_name' => $emp->middle_name,
                    'last_name' => $emp->last_name,
                    'station' => $emp->station,
                    'leave_type' => $leaveType,
                ];
            });

        // =========================
        // RETURN TO INERTIA
        // =========================
        return Inertia::render('Dashboard/Dashboard', [
            'attendances' => $attendances,
            'employees' => $employees,
            'stations' => Station::orderBy('name')->get(),
            'leaves' => $leaves, // grouped version
        ]);
    }
}