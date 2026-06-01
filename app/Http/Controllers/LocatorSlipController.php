<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\LocatorSlip;
use App\Models\Administrator\Employee;
use Carbon\Carbon;

class LocatorSlipController extends Controller
{
    public function index(Request $request)
    {
        /** @var User|null $user */
        $user = Auth::user();
        $employee = $user?->employee()->with('station')->first();

        return Inertia::render('Employee/LocatorSlip/LocatorSlipPage', [
            'employee' => $employee,
            'created_slip' => session('created_slip'),
            'success_message' => session('success_message'),
            'error_message' => session('error_message'),
        ]);
    }

    public function store(Request $request)
    {
        /** @var User|null $user */
        $user = Auth::user();
        $employee = $user?->employee;

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'employee_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'permanent_station' => 'required|string|max:255',
            'purpose_of_travel' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'travel_type' => 'required|in:official_business,official_time',
            'travel_datetime' => 'required|date',
        ]);

        $selectedEmployee = Employee::with('station')
            ->findOrFail($employee?->id ?? $validated['employee_id']);

        $locatorSlip = LocatorSlip::create([
            'employee_id' => $selectedEmployee->id,
            'employee_name' => $selectedEmployee->full_name,
            'position' => $selectedEmployee->position,
            'permanent_station' => $selectedEmployee->station?->name ?? $validated['permanent_station'],
            'purpose_of_travel' => $validated['purpose_of_travel'],
            'destination' => $validated['destination'],
            'travel_type' => $validated['travel_type'],
            'travel_datetime' => Carbon::parse($validated['travel_datetime']),
        ]);

        return redirect()
            ->route('locator-slips')
            ->with('success_message', 'Locator Slip created successfully.')
            ->with('created_slip', $locatorSlip->load('employee.station')->toArray());
    }
}
