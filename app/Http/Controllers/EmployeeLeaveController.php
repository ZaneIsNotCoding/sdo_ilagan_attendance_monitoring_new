<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EmployeeLeave;
use Inertia\Inertia;

class EmployeeLeaveController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'leave_type' => 'required|in:SL,VL,OB,LS,TO',
        ]);

        EmployeeLeave::updateOrCreate(
            [
                'employee_id' => $request->employee_id,
                'date' => $request->date,
            ],
            ['leave_type' => $request->leave_type]
        );
        return redirect()->back()->with('success', 'Leave assigned successfully');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
        ]);

        EmployeeLeave::where('employee_id', $request->employee_id)
            ->where('date', $request->date)
            ->delete();

        return redirect()->back()->with('success', 'Leave removed successfully');
    }
}
