<?php

namespace App\Http\Controllers\HumanResource;

use App\Http\Controllers\Controller;
use App\Models\Administrator\TardinessRecord;
use App\Models\HumanResource\TardyConvertion;
use App\Models\HumanResource\TardyBatch;
use App\Models\HumanResource\ConvertionHours;
use App\Models\HumanResource\ConvertionMinutes;
use App\Models\HumanResource\Period;
use App\Models\HumanResource\VacationLeave;
use App\Services\HourNormalization;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TardyConvertionController extends Controller
{
    public function index(Request $request)
    {
        $monthFilter = $request->input('month'); // expects format YYYY-MM

        // ✅ Fetch tardiness records with employee relation
        $records = TardinessRecord::with('employee.office')
            ->whereDoesntHave('tardyConvertions')
            ->get();

        $conversionHours = ConvertionHours::all();
        $conversionMinutes = ConvertionMinutes::all();

        // 🔹 Filter by month if requested
        if ($monthFilter) {
            $records = $records->filter(function ($record) use ($monthFilter) {
                return Carbon::parse($record->date)->format('Y-m') === $monthFilter;
            });
        }

        // 🔹 Group records by employee and month
        $grouped = $records->groupBy(function ($record) {
            return optional($record->employee)->id . '_' . Carbon::parse($record->date)->format('Y-m');
        });

        // 🔹 Build summary
        $monthlySummary = $grouped->map(function ($group) {
            $employee = $group->first()->employee;
            $recordDate = $group->first()->date;

            // ✅ Step 1: collect tardy decimals
            $totals = $group->pluck('converted_tardy')->toArray();

            // ✅ Step 2: sum with the .6 = 1 rule (via service)
            $totalTardy = HourNormalization::sum($totals);

            return [
                'employee_id' => optional($employee)->id,
                'name'        => optional($employee)->first_name . ' ' . optional($employee)->last_name,
                'dept'        => optional($employee?->office)->name,
                'date'        => $recordDate,
                'total_tardy' => $totalTardy,
            ];
        })->values();

        return Inertia::render('HR/TardyConvertion/TardyConvertion', [
            'records' => $monthlySummary,
            'conversionHours' => $conversionHours,
            'conversionMinutes' => $conversionMinutes,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'summaries' => 'required|array',
            'summaries.*.employee_id' => 'required|exists:employees,id',
            'summaries.*.start_month' => 'required|date',
            'summaries.*.end_month' => 'required|date',
            'summaries.*.total_tardy' => 'required|numeric',
            'summaries.*.total_hours' => 'required|numeric',
            'summaries.*.total_minutes' => 'required|numeric',
            'summaries.*.total_equivalent' => 'required|numeric', // 👈 this must be in leave days (e.g., 0.25, 0.5, 1.0)
        ]);

        // 1️⃣ Create the batch
        $firstSummary = $data['summaries'][0];
        $batch = TardyBatch::create([
            'batch_code'  => 'BATCH-' . now()->format('YmdHis'),
            'start_month' => $firstSummary['start_month'],
            'end_month'   => $firstSummary['end_month'],
        ]);

        foreach ($data['summaries'] as $summary) {
            // 2️⃣ Save tardy conversion
            $tardyConversion = TardyConvertion::create([
                ...$summary,
                'batch_id' => $batch->id
            ]);

            // 3️⃣ Attach tardiness records
            $records = TardinessRecord::where('employee_id', $summary['employee_id'])
                ->whereBetween('date', [$summary['start_month'], $summary['end_month']])
                ->pluck('id');

            $tardyConversion->tardinessRecords()->attach($records);

            $period = Period::firstOrCreate(
                [
                    'employee_id' => $summary['employee_id'],
                    'period'      => Carbon::parse($summary['end_month'])->startOfMonth()->toDateString(),
                ]
            );

            $period->particulars = "TD " . Carbon::now()->format('d');
            $period->save();

            // 5️⃣ Deduct leave credits in VacationLeave
            $vacLeave = VacationLeave::firstOrNew(
                [
                    'employee_id' => $summary['employee_id'],
                    'period_id'   => $period->id,
                ]
            );

            // If new, initialize fields
            if (!$vacLeave->exists) {
                $vacLeave->earned     = 0;
                $vacLeave->used_wpay  = 0;
                $vacLeave->used_wopay = 0;
                $vacLeave->balance    = $vacLeave->earned;
            }

            // Deduct equivalent leave
            $vacLeave->used_wpay  += $summary['total_equivalent'];
            $vacLeave->balance     = max(0, $vacLeave->earned - $vacLeave->used_wpay);
            $vacLeave->remarks     = 'Deduction from tardiness conversion (Batch: ' . $batch->batch_code . ')';
            $vacLeave->save();
        }

        return redirect()->back()->with('success');
    }
}
