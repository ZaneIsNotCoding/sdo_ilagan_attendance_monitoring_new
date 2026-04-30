<?php

namespace App\Http\Controllers;

use App\Models\Administrator\AttendanceAm;
use App\Models\Administrator\Employee;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function dashboard()
    {
        // 1️⃣ Average AM-in
        $avgAmTimeIn = AttendanceAm::selectRaw(
            "SEC_TO_TIME(AVG(TIME_TO_SEC(am_time_in))) as average_am_time_in"
        )->value('average_am_time_in');

        // 2️⃣ Best department (earliest avg AM-in)
        $bestDepartment = Employee::with(['attendances.am', 'office'])
            ->get()
            ->map(function ($emp) {
                $times = $emp->attendances
                    ->map(fn($a) => optional($a->am)->am_time_in)
                    ->filter();
                if ($times->count() > 0) {
                    $avg = $times->avg(fn($t) => strtotime($t));
                    return [
                        'department' => $emp->office?->name,
                        'avg_time' => date("H:i:s", $avg),
                    ];
                }
                return null;
            })
            ->filter()
            ->groupBy('department')
            ->map(function ($rows, $dept) {
                $avg = collect($rows)->avg(fn($r) => strtotime($r['avg_time']));
                return [
                    'department' => $dept,
                    'avg_time' => date("H:i:s", $avg),
                ];
            })
            ->sortBy('avg_time')
            ->first();

        // 3️⃣ Late % (after 8:00 AM)
        $lateCount = AttendanceAm::where('am_time_in', '>', '08:00:00')->count();
        $total = AttendanceAm::count();
        $latePercentage = $total > 0 ? round(($lateCount / $total) * 100, 2) : 0;

        // 4️⃣ Monthly Trends (average AM-in per month)
        $monthlyTrends = AttendanceAm::selectRaw("
                DATE_FORMAT(created_at, '%Y-%m') as month,
                SEC_TO_TIME(AVG(TIME_TO_SEC(am_time_in))) as avg_am_time
            ")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // 5️⃣ Top 5 Most Late Employees
        $topLateEmployees = Employee::withCount(['attendances as late_count' => function($q) {
            $q->join('attendance_ams', 'attendances.id', '=', 'attendance_ams.attendance_id')
              ->where('attendance_ams.am_time_in', '>', '08:00:00');
        }])
        ->orderByDesc('late_count')
        ->take(5)
        ->with('office:id,name')
        ->get(['id', 'first_name', 'last_name', 'office_id']);

        // 6️⃣ On-time Arrival Rate
        $onTimeCount = AttendanceAm::where('am_time_in', '<=', '08:00:00')->count();
        $onTimeRate = $total > 0 ? round(($onTimeCount / $total) * 100, 2) : 0;

        // 7️⃣ Best Employee (Most On-time)
        $bestEmployee = Employee::withCount(['attendances as on_time_count' => function($q) {
            $q->join('attendance_ams', 'attendances.id', '=', 'attendance_ams.attendance_id')
              ->where('attendance_ams.am_time_in', '<=', '08:00:00');
        }])
        ->orderByDesc('on_time_count')
        ->first();

        // 8️⃣ Department Ranking (average AM-in per department)
        $departmentRanking = Employee::with(['attendances.am', 'office'])
            ->get()
            ->groupBy(fn ($employee) => $employee->office?->name ?? 'No Office')
            ->map(function($emps, $dept) {
                $times = $emps->flatMap(fn($e) => $e->attendances->pluck('am.am_time_in')->filter());
                $avg = $times->count() ? date('H:i:s', round($times->map(fn($t) => strtotime($t))->avg())) : null;
                return ['department' => $dept, 'avg_am_time' => $avg];
            })
            ->sortBy('avg_am_time')
            ->values();

        return Inertia::render('Dashboard', [
            'averageAmIn' => $avgAmTimeIn,
            'bestDepartment' => $bestDepartment,
            'latePercentage' => $latePercentage,
            'monthlyTrends' => $monthlyTrends,
            'topLateEmployees' => $topLateEmployees,
            'onTimeRate' => $onTimeRate,
            'bestEmployee' => $bestEmployee,
            'departmentRanking' => $departmentRanking,
            'employees' => Employee::with('office:id,name')->select('id', 'first_name', 'last_name', 'position', 'office_id')->get()
        ]);
    }
}
