<?php

namespace App\Http\Controllers\Administrator;

use App\Data\Administrator\DailyTimeRecordListFilter\DailyTimeRecordFilter;
use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Http\Controllers\Controller;
use App\Models\Administrator\WorkSchedule;
use App\Models\Administrator\WorkType;
use App\Services\Administrator\DailyTimeRecord\DailyTimeRecordService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DailyTimeRecordController extends Controller
{
    use ValidatesPassword;

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

    public function offices(Request $request)
    {
        return response()->json(
            $this->dailyTimeRecords->officePrintData($request, $this->stationId()),
        );
    }

    public function details($employeeId)
    {
        return response()->json(
            $this->dailyTimeRecords->detailsData((int) $employeeId, $this->stationId()),
        );
    }

    public function storeWorkType(Request $request)
    {
        $this->dailyTimeRecords->storeWorkType($this->validateWorkType($request));

        return back()->with('success', 'Work type added successfully.');
    }

    public function updateWorkType(Request $request, WorkType $workType)
    {
        $this->ensureValidPassword($request);
        $this->dailyTimeRecords->updateWorkType($workType, $this->validateWorkType($request));

        return back()->with('success', 'Work type updated successfully.');
    }

    public function destroyWorkType(Request $request, WorkType $workType)
    {
        $this->ensureValidPassword($request);

        try {
            $this->dailyTimeRecords->deleteWorkType($workType);
        } catch (\InvalidArgumentException $exception) {
            return $this->redirectToCleanDailyTimeRecord($request)
                ->with('error', $exception->getMessage());
        }

        return $this->redirectToCleanDailyTimeRecord($request)
            ->with('success', 'Work type deleted successfully.');
    }

    public function storeWorkSchedule(Request $request)
    {
        $this->dailyTimeRecords->storeWorkSchedule($this->validateWorkSchedule($request));

        return back()->with('success', 'Work schedule added successfully.');
    }

    public function updateWorkSchedule(Request $request, WorkSchedule $workSchedule)
    {
        $this->ensureValidPassword($request);
        $this->dailyTimeRecords->updateWorkSchedule($workSchedule, $this->validateWorkSchedule($request));

        return back()->with('success', 'Work schedule updated successfully.');
    }

    public function destroyWorkSchedule(Request $request, WorkSchedule $workSchedule)
    {
        $this->ensureValidPassword($request);
        $this->dailyTimeRecords->deleteWorkSchedule($workSchedule);

        return $this->redirectToCleanDailyTimeRecord($request)
            ->with('success', 'Work schedule deleted successfully.');
    }

    private function redirectToCleanDailyTimeRecord(Request $request)
    {
        $query = [];
        $previousUrl = (string) $request->headers->get('referer', '');
        $previousQuery = parse_url($previousUrl, PHP_URL_QUERY);

        if ($previousQuery) {
            parse_str($previousQuery, $query);
        }

        unset(
            $query['modal'],
            $query['work_type_id'],
            $query['work_schedule_id'],
        );

        return redirect()->route('dailytimerecord', $query);
    }

    private function stationId(): int
    {
        $stationId = optional(auth()->user()->employee)->station_id;

        if (! $stationId) {
            abort(403, 'Station not assigned to this user.');
        }

        return (int) $stationId;
    }

    private function validateWorkType(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);
    }

    private function validateWorkSchedule(Request $request): array
    {
        return $request->validate([
            'work_type_id' => ['required', Rule::exists('work_types', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'time_in' => ['required', 'date_format:H:i'],
            'time_out' => ['required', 'date_format:H:i'],
        ]);
    }
}
