<?php

namespace App\Http\Controllers;

use App\Models\Administrator\Employee;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\Station;
use Carbon\Carbon;
use Inertia\Inertia;

class AttendanceMonitoringController extends Controller
{
     public function index()
    {
        $today = Carbon::today();
        $attendances = Attendance::with([
            'employee.station',
            'am',
            'pm'
        ])
        ->whereDate('date', $today)
        ->latest()
        ->get();

        $employees = Employee::with('station')
            ->get()
            ->map(function ($emp) {
                return [
                    'id' => $emp->id,
                    'employee_id' => $emp->id,
                    'first_name' => $emp->first_name,
                    'middle_name' => $emp->middle_name,
                    'last_name' => $emp->last_name,
                    'profile_img' => $emp->profile_img,
                    'station' => $emp->station,
                ];
            });

        return Inertia::render('AttendanceMonitoring/AttendanceMonitoring', [
            'attendances' => $attendances,
            'employees' => $employees,
            'stations' => Station::orderBy('id')->get(),
        ]);
    }
}
