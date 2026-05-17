<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\EmployeeManagement\StoreEmployeeRequest;
use App\Http\Requests\Administrator\EmployeeManagement\UpdateEmployeeRequest;
use App\Services\Administrator\EmployeeManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;


class EmployeeManagementController extends Controller
{
    use ValidatesPassword;

    public function __construct(
        private readonly EmployeeManagementService $employees,
    ) {}
    
    public function index(Request $request)
    {
        $user = auth()->user();
        $stationId = $user->employee->station_id;
        $limit = $this->employees->listLimit($request);

        if ((string) $request->query('limit') !== (string) $limit) {
            return redirect()->to($request->fullUrlWithQuery([
                'limit' => $limit,
            ]));
        }

        $employeeList = $this->employees->employeeListData($request, $stationId);
        $options = $this->employees->pageOptions();

        return Inertia::render('Admin/EmployeeManagement/EmployeeManagement', [
            'offices' => $employeeList['offices'],
            'filteredEmployeesList' => $employeeList['filteredEmployeesList'],
            'stations' => $options['stations'],
            'workSchedules' => $options['workSchedules'],
            'selectedFingerprintEmployee' => $this->employees->selectedFingerprintEmployee($request, $stationId),
            'userStation' => $user->employee->station->name ?? null,
            'userStationId' => $stationId,
            'search' => $employeeList['search'],
            'status' => $employeeList['status'],
            'officeName' => $employeeList['officeName'],
            'limit' => $employeeList['limit'],
            'editEmployeeModal' => $this->employees->editModal($request, 'edit-employee'),
            'testFingerprintModal' => $this->employees->testFingerprintModal($request),
            'fingerprintServiceUrl' => $this->employees->fingerprintServiceUrl($request),
        ]);
    }

    public function suggestions(Request $request)
    {
        $user = auth()->user();
        $stationId = $user->employee->station_id;

        return response()->json(
            $this->employees->suggestions($request, $stationId),
        );
    }

    public function store(StoreEmployeeRequest $request)
    {
        $validated = $request->validated();
        $this->employees->store($validated, $request);
        $fullName = $this->employees->successName($validated);

        return redirect()->back()->with(
            'success',
            "Employee {$fullName} added successfully!",
        );
    }

    public function update(UpdateEmployeeRequest $request, $id)
    {
        $this->ensureValidPassword($request);
        
        $validated = $request->validated();
        unset($validated['password']);

        $this->employees->update((int) $id, $validated, $request);

        return back()->with('success', 'Employee updated successfully 🎉');
    }

}
