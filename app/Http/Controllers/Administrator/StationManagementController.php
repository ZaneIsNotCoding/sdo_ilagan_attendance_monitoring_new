<?php

namespace App\Http\Controllers\Administrator;

use App\Data\Administrator\StationManagementListFilter\StationEmployeeCandidateFilter;
use App\Data\Administrator\StationManagementListFilter\StationPageFilter;
use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StationManagement\{
    UpdateStationRequest,
    UpdateStationAssignmentRequest,
    StoreStationRequest,
    StationEmployeeCandidateRequest,
    StoreStationAdminRequest,
};
use App\Models\Administrator\Station;
use App\Models\Administrator\StationAssignment;
use App\Services\Administrator\StationManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StationManagementController extends Controller
{
    use ValidatesPassword;

    public function __construct(
        private readonly StationManagementService $stations,
    ) {}

    public function index(Request $request)
    {
        $filter = StationPageFilter::fromRequest($request);

        if ($filter->hasInvalidLimits($request)) {
            return redirect()->to($request->fullUrlWithQuery([
                'station_limit' => $filter->stationLimit,
                'admin_limit' => $filter->adminLimit,
            ]));
        }

        return Inertia::render(
            'Admin/StationManagement/StationManagement',
            $this->stations->pageData($request, $filter),
        );
    }

    public function adminRows(Request $request)
    {
        return response()->json(
            $this->stations->adminRows(StationPageFilter::fromRequest($request)),
        );
    }

    public function stationRows(Request $request)
    {
        return response()->json(
            $this->stations->stationRows(StationPageFilter::fromRequest($request)),
        );
    }

    public function suggestions(Request $request)
    {
        return response()->json(
            $this->stations->suggestions($request),
        );
    }

    public function adminEmployeeCandidates(StationEmployeeCandidateRequest $request)
    {
        return response()->json(
            $this->stations->employeeCandidates(
                StationEmployeeCandidateFilter::fromArray($request->validated()),
            ),
        );
    }

    public function destroy(Request $request, $id)
    {
        $this->ensureValidPassword($request);
        $this->stations->deleteAdmin((int) $id);

        return back()->with('success', 'Station admin removed successfully.');
    }

    public function store(StoreStationAdminRequest $request)
    {
        $this->stations->assignAdmin($request->validated());

        return back()->with('success', 'Station admin assigned successfully.');
    }

    public function storeStation(StoreStationRequest $request)
    {
        $this->stations->storeStation($request->validated());

        return back()->with('success', 'Station added successfully.');
    }

    public function updateStation(UpdateStationRequest $request, Station $station)
    {
        $this->ensureValidPassword($request);
        $this->stations->updateStation($station, $request->validated());

        return back()->with('success', 'Station updated successfully.');
    }

    public function destroyStation(Request $request, Station $station)
    {
        $this->ensureValidPassword($request);
        $this->stations->deleteStation($station);

        return back()->with('success', 'Station deleted successfully.');
    }

    public function updateStationAssignment(
        UpdateStationAssignmentRequest $request,
        StationAssignment $stationAssignment,
    ) {
        $this->ensureValidPassword($request);
        $this->stations->updateStationAssignment($stationAssignment, $request->validated());

        return back()->with('success', 'SDO Station updated successfully.');
    }

    public function destroyStationAssignment(
        Request $request,
        StationAssignment $stationAssignment,
    ) {
        $this->ensureValidPassword($request);
        $this->stations->deleteStationAssignment($stationAssignment);

        return back()->with('success', 'SDO Station deleted successfully.');
    }
}