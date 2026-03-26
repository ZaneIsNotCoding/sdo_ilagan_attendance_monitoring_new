<?php

namespace App\Http\Controllers;

use App\Models\Administrator\AttendanceAm;
use App\Models\Administrator\Employee;
use Inertia\Inertia;
use App\Models\User;

class DashboardController extends Controller
{
    public function dashboard()
    {
        $users = Employee::with('station')->get();

        return Inertia::render('Dashboard/Dashboard', [
            'users' => $users,
            'stations' => \App\Models\Station::orderBy('name')->get()
        ]);
    }
}
