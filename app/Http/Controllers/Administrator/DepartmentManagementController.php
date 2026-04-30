<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Administrator\DivisionHead;
use App\Models\Administrator\Office;
use App\Models\Division;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Throwable;

class DepartmentManagementController extends Controller
{
    use ValidatesPassword;

    public function index()
    {
        $officeSearch = trim((string) request('office_search', request('search', '')));
        $divisionSearch = trim((string) request('division_search', ''));

        $allOfficeHeads = DivisionHead::with([
            'employee:id,first_name,middle_name,last_name,profile_img,position,office_id,work_type',
            'employee.office:id,name,division_id',
            'employee.office.division:id,code,name',
            'division:id,code,name',
        ])->where('type', 'unit_head');

        $officeHeads = (clone $allOfficeHeads)->latest()->get();

        $filteredOfficeHeads = (clone $allOfficeHeads);

        if ($officeSearch !== '') {
            $filteredOfficeHeads->where(function ($query) use ($officeSearch) {
                $query->whereHas('division', function ($divisionQuery) use ($officeSearch) {
                    $divisionQuery->where('code', 'like', "%{$officeSearch}%")
                        ->orWhere('name', 'like', "%{$officeSearch}%");
                })->orWhereHas('employee.office', function ($officeQuery) use ($officeSearch) {
                    $officeQuery->where('name', 'like', "%{$officeSearch}%");
                })->orWhereHas('employee', function ($employeeQuery) use ($officeSearch) {
                    $employeeQuery->where('first_name', 'like', "%{$officeSearch}%")
                        ->orWhere('middle_name', 'like', "%{$officeSearch}%")
                        ->orWhere('last_name', 'like', "%{$officeSearch}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$officeSearch}%"],
                        );
                });
            });
        }

        $filteredOfficeHeads = $filteredOfficeHeads->latest()->get();

        $allDivisionHeads = DivisionHead::with([
            'employee:id,first_name,middle_name,last_name,profile_img,position,office_id,work_type',
            'employee.office:id,name,division_id',
            'employee.office.division:id,code,name',
            'division:id,code,name',
        ])->where('type', 'division_head');

        $divisionHeads = (clone $allDivisionHeads)->latest()->get();

        $filteredDivisionHeads = (clone $allDivisionHeads);

        if ($divisionSearch !== '') {
            $filteredDivisionHeads->where(function ($query) use ($divisionSearch) {
                $query->whereHas('division', function ($divisionQuery) use ($divisionSearch) {
                    $divisionQuery->where('code', 'like', "%{$divisionSearch}%")
                        ->orWhere('name', 'like', "%{$divisionSearch}%");
                })->orWhereHas('employee.office', function ($officeQuery) use ($divisionSearch) {
                    $officeQuery->where('name', 'like', "%{$divisionSearch}%")
                        ->orWhereHas('division', function ($divisionQuery) use ($divisionSearch) {
                            $divisionQuery->where('code', 'like', "%{$divisionSearch}%")
                                ->orWhere('name', 'like', "%{$divisionSearch}%");
                        });
                })->orWhereHas('employee', function ($employeeQuery) use ($divisionSearch) {
                    $employeeQuery->where('first_name', 'like', "%{$divisionSearch}%")
                        ->orWhere('middle_name', 'like', "%{$divisionSearch}%")
                        ->orWhere('last_name', 'like', "%{$divisionSearch}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$divisionSearch}%"],
                        );
                });
            });
        }

        $filteredDivisionHeads = $filteredDivisionHeads->latest()->get();

        $divisions = Division::select('id', 'code', 'name')
            ->orderBy('code')
            ->get();

        $offices = Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->orderBy('name')
            ->get();

        $employees = Employee::with('office:id,name,division_id')
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'work_type',
                'position',
                'office_id',
                'station_id'
            )
            ->get();

        return Inertia::render('Admin/DepartmentManagement/DepartmentManagement', [
            'office_heads' => $officeHeads,
            'filtered_office_heads' => $filteredOfficeHeads,
            'division_heads' => $divisionHeads,
            'filtered_division_heads' => $filteredDivisionHeads,
            'divisions' => $divisions,
            'offices' => $offices,
            'employees' => $employees,
            'office_search' => $officeSearch,
            'division_search' => $divisionSearch,
        ]);
    }

    public function storeHead(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'office_id' => 'required|exists:offices,id',
        ]);

        $office = Office::findOrFail($validated['office_id']);
        $employee = Employee::with('office')->findOrFail($validated['employee_id']);

        if ((string) $employee->office_id !== (string) $office->id) {
            return back()->withErrors([
                'office_id' => 'The selected employee must belong to the selected office.',
            ]);
        }

        DivisionHead::updateOrCreate(
            [
                'division_id' => $office->division_id,
                'type' => 'unit_head',
            ],
            [
                'employee_id' => $employee->id,
            ],
        );

        return back()->with('success', 'Office head added successfully!');
    }

    public function storeDivisionHead(Request $request)
    {
        $validated = $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'employee_id' => 'required|exists:employees,id',
        ]);

        $employee = Employee::with('office')->findOrFail($validated['employee_id']);

        DivisionHead::updateOrCreate(
            [
                'division_id' => $validated['division_id'],
                'type' => 'division_head',
            ],
            [
                'employee_id' => $validated['employee_id'],
            ],
        );

        return back()->with('success', 'Division head added successfully!');
    }

    public function destroy(Request $request, $id)
    {
        $this->ensureValidPassword($request);

        $record = DivisionHead::findOrFail($id);
        $record->delete();

        return back()->with('success', 'Deleted successfully.');
    }

    public function destroyDivisionHead(Request $request, $id)
    {
        $this->ensureValidPassword($request);

        $record = DivisionHead::where('type', 'division_head')->findOrFail($id);
        $record->delete();

        return back()->with('success', 'Division head deleted successfully.');
    }

    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:divisions,code',
            'name' => 'required|string|max:255|unique:divisions,name',
        ]);

        Division::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Division created successfully!');
    }

    public function storeOffice(Request $request)
    {
        $validated = $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('offices', 'name')->where(function ($query) use ($request) {
                    return $query->where('division_id', $request->division_id);
                }),
            ],
        ]);

        Office::create([
            'division_id' => $validated['division_id'],
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Office created successfully!');
    }

    public function updateOffice(Request $request, $id)
    {
        $this->ensureValidPassword($request);

        $validated = $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('offices', 'name')
                    ->where(function ($query) use ($request) {
                        return $query->where('division_id', $request->division_id);
                    })
                    ->ignore($id),
            ],
        ]);

        $office = Office::findOrFail($id);
        $office->update([
            'division_id' => $validated['division_id'],
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Office updated successfully!');
    }

    public function destroyOffice(Request $request, $id)
    {
        $this->ensureValidPassword($request);

        $office = Office::findOrFail($id);
        $office->delete();

        return back()->with('success', 'Office deleted successfully!');
    }

    public function suggestDepartmentNames(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|min:1|max:50',
        ]);

        $apiKey = env('OPENAI_API_KEY');

        if (! $apiKey) {
            return response()->json([
                'suggestions' => [],
                'message' => 'OPENAI_API_KEY is not configured.',
            ]);
        }

        $query = trim($validated['query']);

        try {
            $response = Http::withToken($apiKey)
                ->timeout(12)
                ->post('https://api.openai.com/v1/responses', [
                    'model' => env('OPENAI_MODEL', 'gpt-5-mini'),
                    'input' => [
                        [
                            'role' => 'system',
                            'content' => [
                                [
                                    'type' => 'input_text',
                                    'text' => 'You suggest realistic division names for a school or government office management system. Return only short division-name suggestions.',
                                ],
                            ],
                        ],
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'input_text',
                                    'text' => "Suggest up to 6 realistic division names that begin with or closely match this input: \"{$query}\". Return JSON only.",
                                ],
                            ],
                        ],
                    ],
                    'text' => [
                        'format' => [
                            'type' => 'json_schema',
                            'name' => 'division_name_suggestions',
                            'strict' => true,
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'suggestions' => [
                                        'type' => 'array',
                                        'items' => [
                                            'type' => 'string',
                                        ],
                                        'maxItems' => 6,
                                    ],
                                ],
                                'required' => ['suggestions'],
                                'additionalProperties' => false,
                            ],
                        ],
                    ],
                ]);

            if (! $response->successful()) {
                return response()->json([
                    'suggestions' => [],
                    'message' => 'Suggestion service is currently unavailable.',
                ], 502);
            }

            $payload = $response->json();
            $jsonText = data_get($payload, 'output.0.content.0.text');
            $decoded = json_decode($jsonText ?? '{}', true);

            $suggestions = collect($decoded['suggestions'] ?? [])
                ->filter(fn ($item) => is_string($item) && trim($item) !== '')
                ->map(fn ($item) => trim($item))
                ->unique()
                ->values()
                ->all();

            return response()->json([
                'suggestions' => $suggestions,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'suggestions' => [],
                'message' => 'Suggestion service failed to respond.',
            ], 500);
        }
    }

    public function updateDepartment(Request $request, $id)
    {
        $this->ensureValidPassword($request);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:divisions,code,' . $id,
            'name' => 'required|string|max:255|unique:divisions,name,' . $id,
        ]);

        $division = Division::findOrFail($id);
        $division->update([
            'code' => $validated['code'],
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Division updated successfully!');
    }

    public function destroyDepartment(Request $request, $id)
    {
        $this->ensureValidPassword($request);

        $division = Division::findOrFail($id);
        $division->delete();

        return back()->with('success', 'Division deleted successfully');
    }
}
