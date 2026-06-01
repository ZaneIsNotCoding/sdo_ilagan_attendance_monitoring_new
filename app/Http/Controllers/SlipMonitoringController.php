<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Models\ApplicationForLeave;
use App\Models\LocatorSlip;
use App\Models\TravelOrder;
use App\Services\DtrAdjustmentService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SlipMonitoringController extends Controller
{
    use ValidatesPassword;

    public function __construct(private readonly DtrAdjustmentService $dtrAdjustmentService) {}

    public function index(Request $request)
    {
        $selectedType = $this->resolveType($request);
        $filters = $this->resolveFilters($request);

        $today = Carbon::today();

        $props = [
            'selectedType' => $selectedType,
            'filters' => $filters,
            'dashboardCounts' => [
                'locatorSlipsToday' => LocatorSlip::whereDate('travel_datetime', $today)->count(),
                'travelOrdersThisMonth' => TravelOrder::whereYear('inclusive_dates', $today->year)
                    ->whereMonth('inclusive_dates', $today->month)
                    ->count(),
                'leaveApplicationsThisMonth' => ApplicationForLeave::whereYear('date_of_filing', $today->year)
                    ->whereMonth('date_of_filing', $today->month)
                    ->count(),
                'totalRecords' => LocatorSlip::count() + TravelOrder::count() + ApplicationForLeave::count(),
            ],
        ];

        if ($selectedType === 'locator-slip') {
            $props['locator_slips'] = $this->queryForType($selectedType, $filters)
                ->latest()
                ->paginate(10)
                ->withQueryString();
        }

        if ($selectedType === 'travel-order') {
            $props['travel_orders'] = $this->queryForType($selectedType, $filters)
                ->latest()
                ->paginate(10)
                ->withQueryString();
        }

        if ($selectedType === 'application-leave') {
            $props['leave_applications'] = $this->queryForType($selectedType, $filters)
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString();
        }

        return Inertia::render('Admin/SlipMonitoring/Index', $props);
    }

    private function resolveType(Request $request): string
    {
        $selectedType = $request->query('type', 'locator-slip');

        return in_array($selectedType, ['locator-slip', 'travel-order', 'application-leave'], true)
            ? $selectedType
            : 'locator-slip';
    }

    private function resolveFilters(Request $request): array
    {
        return [
            'date' => $request->query('date', ''),
            'date_from' => $request->query('date_from', ''),
            'date_to' => $request->query('date_to', ''),
            'month' => $request->query('month', ''),
            'search' => trim((string) $request->query('search', '')),
        ];
    }

    private function queryForType(string $type, array $filters)
    {
        return match ($type) {
            'travel-order' => $this->applyTravelOrderFilters(
                TravelOrder::with('employee.station'),
                $filters,
            ),
            'application-leave' => $this->applyApplicationLeaveFilters(
                ApplicationForLeave::with('employee.station', 'employee.office'),
                $filters,
            ),
            default => $this->applyLocatorSlipFilters(
                LocatorSlip::with('employee.station'),
                $filters,
            ),
        };
    }

    private function applyDateFilters($query, string $field, array $filters)
    {
        if (! empty($filters['date'])) {
            return $query->whereDate($field, $filters['date']);
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate($field, '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate($field, '<=', $filters['date_to']);
        }

        if (empty($filters['date_from']) && empty($filters['date_to']) && ! empty($filters['month'])) {
            $month = Carbon::createFromFormat('Y-m', $filters['month']);
            $query->whereYear($field, $month->year)
                ->whereMonth($field, $month->month);
        }

        return $query;
    }

    private function applyLocatorSlipFilters($query, array $filters)
    {
        $query = $this->applyDateFilters($query, 'travel_datetime', $filters);
        $search = $filters['search'];

        return $query->when($search !== '', function ($query) use ($search) {
            $query->where(function ($query) use ($search) {
                $query->where('employee_name', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhere('permanent_station', 'like', "%{$search}%")
                    ->orWhere('purpose_of_travel', 'like', "%{$search}%")
                    ->orWhere('travel_type', 'like', "%{$search}%")
                    ->orWhere('destination', 'like', "%{$search}%")
                    ->orWhereHas('employee', function ($employeeQuery) use ($search) {
                        $this->applyEmployeeSearch($employeeQuery, $search);
                    });
            });
        });
    }

    private function applyTravelOrderFilters($query, array $filters)
    {
        $query = $this->applyDateFilters($query, 'inclusive_dates', $filters);
        $search = $filters['search'];

        return $query->when($search !== '', function ($query) use ($search) {
            $query->where(function ($query) use ($search) {
                $query->where('employee_name', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhere('permanent_station', 'like', "%{$search}%")
                    ->orWhere('purpose_of_travel', 'like', "%{$search}%")
                    ->orWhere('host_of_activity', 'like', "%{$search}%")
                    ->orWhere('inclusive_dates', 'like', "%{$search}%")
                    ->orWhere('destination', 'like', "%{$search}%")
                    ->orWhere('fund_source', 'like', "%{$search}%")
                    ->orWhereHas('employee', function ($employeeQuery) use ($search) {
                        $this->applyEmployeeSearch($employeeQuery, $search);
                    });
            });
        });
    }

    private function applyApplicationLeaveFilters($query, array $filters)
    {
        $query = $this->applyDateFilters($query, 'date_of_filing', $filters);
        $search = $filters['search'];

        return $query->when($search !== '', function ($query) use ($search) {
            $query->where(function ($query) use ($search) {
                $query->where('employee_name', 'like', "%{$search}%")
                    ->orWhere('office_department', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhere('type_of_leave', 'like', "%{$search}%")
                    ->orWhere('type_of_leave_other', 'like', "%{$search}%")
                    ->orWhere('inclusive_dates', 'like', "%{$search}%")
                    ->orWhereHas('employee', function ($employeeQuery) use ($search) {
                        $this->applyEmployeeSearch($employeeQuery, $search);
                        $employeeQuery->orWhereHas('office', function ($officeQuery) use ($search) {
                            $officeQuery->where('name', 'like', "%{$search}%");
                        });
                    });
            });
        });
    }

    private function applyEmployeeSearch($employeeQuery, string $search): void
    {
        $employeeQuery->where('first_name', 'like', "%{$search}%")
            ->orWhere('middle_name', 'like', "%{$search}%")
            ->orWhere('last_name', 'like', "%{$search}%")
            ->orWhere('position', 'like', "%{$search}%")
            ->orWhereRaw(
                "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                ["%{$search}%"],
            )
            ->orWhereHas('station', function ($stationQuery) use ($search) {
                $stationQuery->where('name', 'like', "%{$search}%");
            });
    }

    public function destroy(Request $request, string $type, int $id)
    {
        $this->ensureValidPassword($request);

        $model = match ($type) {
            'locator-slip' => LocatorSlip::class,
            'travel-order' => TravelOrder::class,
            'application-leave' => ApplicationForLeave::class,
            default => null,
        };

        abort_if($model === null, 404);

        $record = $model::query()->findOrFail($id);
        $this->dtrAdjustmentService->removeSourceEntries($model, $record->id);
        $record->delete();

        return back()->with('success', 'Slip record deleted successfully.');
    }

    public function destroyMany(Request $request, string $type)
    {
        $this->ensureValidPassword($request);

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $model = match ($type) {
            'locator-slip' => LocatorSlip::class,
            'travel-order' => TravelOrder::class,
            'application-leave' => ApplicationForLeave::class,
            default => null,
        };

        abort_if($model === null, 404);

        $records = $model::query()
            ->whereIn('id', $validated['ids'])
            ->get(['id']);

        foreach ($records as $record) {
            $this->dtrAdjustmentService->removeSourceEntries($model, $record->id);
        }

        $deletedCount = $model::query()
            ->whereIn('id', $records->pluck('id'))
            ->delete();

        return back()->with(
            'success',
            "{$deletedCount} slip record(s) deleted successfully.",
        );
    }

    public function updateStatus(Request $request, string $type, int $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected,cancelled,pending'],
        ]);

        $model = match ($type) {
            'locator-slip' => LocatorSlip::class,
            'travel-order' => TravelOrder::class,
            'application-leave' => ApplicationForLeave::class,
            default => null,
        };

        abort_if($model === null, 404);

        $record = $model::query()->findOrFail($id);
        $record->forceFill([
            'status' => $validated['status'],
            'approved_by' => $validated['status'] === 'approved' ? Auth::id() : null,
            'approved_at' => $validated['status'] === 'approved' ? now() : null,
        ])->save();

        $this->dtrAdjustmentService->removeSourceEntries($model, $record->id);

        if ($validated['status'] === 'approved') {
            match ($type) {
                'locator-slip' => $this->dtrAdjustmentService->syncFromLocatorSlip($record),
                'travel-order' => $this->dtrAdjustmentService->syncFromTravelOrder($record),
                'application-leave' => $this->dtrAdjustmentService->syncFromApplicationForLeave($record),
            };
        }

        return back()->with('success', 'Request status updated successfully.');
    }

}
