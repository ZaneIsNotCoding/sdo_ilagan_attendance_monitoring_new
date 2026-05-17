<?php

namespace App\Http\Controllers\Administrator;

use App\Data\Administrator\DailyTimeRecordListFilter\DailyTimeRecordFilter;
use App\Http\Controllers\Controller;
use App\Services\Administrator\DailyTimeRecord\DailyTimeRecordService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DailyTimeRecordController extends Controller
{
    public function __construct(
        private readonly DailyTimeRecordService $dailyTimeRecords,
    ) {}

    public function index(Request $request)
    {
        $stationId = $this->stationId();
        $filter = DailyTimeRecordFilter::fromRequest($request, $stationId);

        if ($filter->hasInvalidLimit($request)) {
            return redirect()->to($request->fullUrlWithQuery([
                'limit' => $filter->limit,
            ]));
        }

        return Inertia::render(
            'Admin/DailyTimeRecord/DailyTimeRecord',
            $this->dailyTimeRecords->pageData($request, $stationId),
        );
    }

    public function suggestions(Request $request)
    {
        return response()->json(
            $this->dailyTimeRecords->suggestions($request, $this->stationId()),
        );
    }

    public function departments(Request $request)
    {
        return response()->json(
            $this->dailyTimeRecords->departmentPrintData($request, $this->stationId()),
        );
    }

    public function show($employeeId)
    {
        return Inertia::render(
            'Admin/DailyTimeRecord/ViewDtr',
            $this->dailyTimeRecords->showData((int) $employeeId),
        );
    }

    public function details($employeeId)
    {
        return response()->json(
            $this->dailyTimeRecords->detailsData((int) $employeeId),
        );
    }

    private function stationId(): int
    {
        $stationId = optional(auth()->user()->employee)->station_id;

        if (! $stationId) {
            abort(403, 'Station not assigned to this user.');
        }

        return (int) $stationId;
    }
}
