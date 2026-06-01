<?php

namespace App\Http\Controllers;

use App\Models\Administrator\Employee;
use Illuminate\Http\Request;

class PublicEmployeeLookupController extends Controller
{
    public function __invoke(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        if ($search === '') {
            return response()->json([]);
        }

        $employees = Employee::query()
            ->with(['station:id,name,code', 'office:id,name'])
            ->select([
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'position',
                'station_id',
                'office_id',
                'active_status',
            ])
            ->where('active_status', 1)
            ->where(function ($query) use ($search) {
                $query->where('id', $search)
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhereRaw(
                        "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                        ["%{$search}%"],
                    )
                    ->orWhereHas('station', function ($stationQuery) use ($search) {
                        $stationQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    })
                    ->orWhereHas('office', function ($officeQuery) use ($search) {
                        $officeQuery->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderByName()
            ->limit(8)
            ->get()
            ->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'full_name' => $employee->full_name,
                'position' => $employee->position,
                'station' => $employee->station?->name,
                'station_code' => $employee->station?->code,
                'office' => $employee->office?->name,
            ]);

        return response()->json($employees);
    }
}
