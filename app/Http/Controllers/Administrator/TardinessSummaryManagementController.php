<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Administrator\TardinessRecord;
use App\Services\HourNormalization;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Http\Request;

class TardinessSummaryManagementController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        $department = trim((string) $request->query('department', 'All Departments'));
        $year = (int) $request->query('year', now()->year);
        $year = $year >= 2000 && $year <= 2100 ? $year : now()->year;

        $departments = TardinessRecord::query()
            ->with('employee.office:id,name')
            ->get()
            ->pluck('employee.department')
            ->filter()
            ->unique()
            ->sort(SORT_NATURAL | SORT_FLAG_CASE)
            ->values();

        $years = TardinessRecord::query()
            ->select('date')
            ->get()
            ->map(fn ($record) => (string) Carbon::parse($record->date)->year)
            ->unique()
            ->sortDesc()
            ->values();

        $records = TardinessRecord::with('employee.office:id,name')
            ->whereYear('date', $year)
            ->when($department !== '' && $department !== 'All Departments', function ($query) use ($department) {
                $query->whereHas('employee.office', function ($officeQuery) use ($department) {
                    $officeQuery->where('name', $department);
                });
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas('employee', function ($employeeQuery) use ($search) {
                    $employeeQuery->where('id', $search)
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('position', 'like', "%{$search}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        )
                        ->orWhereRaw(
                            "CONCAT_WS(' ', id, first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        )
                        ->orWhereHas('office', function ($officeQuery) use ($search) {
                            $officeQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->get()
            ->groupBy('employee_id')
            ->map(function ($employeeRecords) {
                $employee = $employeeRecords->first()->employee;

                // Structure: year => [month => sum]
                $tardyPerMonths = [];
                $tardyPerYear = [];

                $employeeRecords->groupBy(function ($record) {
                    return Carbon::parse($record->date)->year;
                })->each(function ($yearGroup, $year) use (&$tardyPerMonths, &$tardyPerYear) {
                    $months = array_fill(1, 12, 0);

                    foreach ($yearGroup as $record) {
                        $monthNum = Carbon::parse($record->date)->month;
                        $months[$monthNum] = HourNormalization::sum([
                            $months[$monthNum],
                            $record->converted_tardy
                        ]);
                    }

                    $tardyPerMonths[$year] = $months;
                    $tardyPerYear[$year] = HourNormalization::sum(array_values($months));
                });

                return [
                    'employee'       => $employee,
                    'tardyPerMonths' => $tardyPerMonths,
                    'tardyPerYear'   => $tardyPerYear,
                ];
            })
            ->values();

        return Inertia::render('Admin/TardinessSummaryManagement/TardinessSummary', [
            'summary' => $records,
            'departments' => $departments,
            'years' => $years,
            'search' => $search,
            'department' => $department,
            'year' => (string) $year,
        ]);
    }
}
