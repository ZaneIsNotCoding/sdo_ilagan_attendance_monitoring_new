<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Http\Controllers\Controller;
use App\Data\Administrator\DepartmentManagementListFilter\DepartmentEmployeeCandidateFilter;
use App\Http\Requests\Administrator\DepartmentManagement\DepartmentEmployeeCandidateRequest;
use App\Http\Requests\Administrator\DepartmentManagement\StoreDivisionHeadRequest;
use App\Http\Requests\Administrator\DepartmentManagement\StoreDivisionRequest;
use App\Http\Requests\Administrator\DepartmentManagement\StoreOfficeHeadRequest;
use App\Http\Requests\Administrator\DepartmentManagement\StoreOfficeRequest;
use App\Http\Requests\Administrator\DepartmentManagement\UpdateDivisionRequest;
use App\Http\Requests\Administrator\DepartmentManagement\UpdateOfficeRequest;
use App\Services\Administrator\DepartmentManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentManagementController extends Controller
{
    use ValidatesPassword;

    public function __construct(
        private readonly DepartmentManagementService $departments,
    ) {}

    public function index(Request $request)
    {
        return Inertia::render(
            'Admin/DepartmentManagement/DepartmentManagement',
            $this->departments->pageData($request),
        );
    }

    public function employeeCandidates(DepartmentEmployeeCandidateRequest $request): JsonResponse
    {
        return response()->json(
            $this->departments->employeeCandidates(
                DepartmentEmployeeCandidateFilter::fromArray($request->validated()),
            ),
        );
    }

    public function storeHead(StoreOfficeHeadRequest $request)
    {
        try {
            $this->departments->storeOfficeHead($request->validated());
        } catch (\InvalidArgumentException $exception) {
            return back()->withErrors([
                'office_id' => $exception->getMessage(),
            ]);
        }

        return back()->with('success', 'Office head added successfully!');
    }

    public function storeDivisionHead(StoreDivisionHeadRequest $request)
    {
        $this->departments->storeDivisionHead($request->validated());

        return back()->with('success', 'Division head added successfully!');
    }

    public function destroy(Request $request, $id)
    {
        $this->ensureValidPassword($request);
        $this->departments->deleteHead((int) $id);

        return back()->with('success', 'Deleted successfully.');
    }

    public function destroyDivisionHead(Request $request, $id)
    {
        $this->ensureValidPassword($request);
        $this->departments->deleteDivisionHead((int) $id);

        return back()->with('success', 'Division head deleted successfully.');
    }

    public function storeDepartment(StoreDivisionRequest $request)
    {
        $this->departments->storeDivision($request->validated());

        return back()->with('success', 'Division created successfully!');
    }

    public function updateDepartment(UpdateDivisionRequest $request, $id)
    {
        $this->ensureValidPassword($request);

        $this->departments->updateDivision((int) $id, $request->validated());

        return back()->with('success', 'Division updated successfully!');
    }

    public function destroyDepartment(Request $request, $id)
    {
        $this->ensureValidPassword($request);
        $this->departments->deleteDivision((int) $id);

        return back()->with('success', 'Division deleted successfully');
    }

    public function storeOffice(StoreOfficeRequest $request)
    {
        $this->departments->storeOffice($request->validated());

        return back()->with('success', 'Office created successfully!');
    }

    public function updateOffice(UpdateOfficeRequest $request, $id)
    {
        $this->ensureValidPassword($request);

        $this->departments->updateOffice((int) $id, $request->validated());

        return back()->with('success', 'Office updated successfully!');
    }

    public function destroyOffice(Request $request, $id)
    {
        $this->ensureValidPassword($request);
        $this->departments->deleteOffice((int) $id);

        return back()->with('success', 'Office deleted successfully!');
    }
}
