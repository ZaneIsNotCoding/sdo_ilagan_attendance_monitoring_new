<?php

namespace App\Http\Controllers;

use App\Models\ApplicationForLeave;
use App\Models\LocatorSlip;
use App\Models\TravelOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SlipMonitoringController extends Controller
{
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

}
