<?php

namespace App\Http\Controllers\Concerns\HandleModalConcerns;

use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use App\Models\Administrator\StationAdmin;
use App\Models\Administrator\StationAssignment;

trait StationModals
{
    public function resolveAssignStationModal(): ?array
    {
        if (request('modal') !== 'station-admin') {
            return null;
        }

        $stationId = request('station_id');
        $role = request('station_role', 'school_admin');
        $source = request('station_source', 'station');

        if (! in_array($role, ['school_admin', 'sdo_admin', 'sdo_hr'], true)) {
            return null;
        }

        if ($source === 'sdo') {
            $assignment = StationAssignment::query()
                ->where('station_id', $stationId)
                ->where('role', $role)
                ->first();

            if (! $assignment) {
                return null;
            }

            return [
                'station_id' => $assignment->station_id,
                'role' => $assignment->role,
                'source' => 'sdo',
                'name' => $assignment->name,
                'code' => $assignment->code,
                'id' => 'sdo-' . $assignment->role,
                'record_id' => $assignment->id,
            ];
        }

        $station = Station::query()
            ->where('code', '!=', 'SDO')
            ->find($stationId);

        if (! $station) {
            return null;
        }

        return [
            'station_id' => $station->id,
            'role' => 'school_admin',
            'source' => 'station',
            'name' => $station->name,
            'code' => $station->code,
            'id' => $station->id,
        ];
    }

    public function resolveStationActionModal(string $modal): ?array
    {
        if (request('modal') !== $modal) {
            return null;
        }

        $stationId = request('station_id');
        $role = request('station_role');
        $source = request('station_source', 'station');

        if ($source === 'sdo') {
            $assignment = StationAssignment::query()
                ->where('station_id', $stationId)
                ->when($role, fn ($query) => $query->where('role', $role))
                ->first();

            if (! $assignment) {
                return null;
            }

            return [
                'id' => 'sdo-' . $assignment->role,
                'record_id' => $assignment->id,
                'station_id' => $assignment->station_id,
                'code' => $assignment->code,
                'name' => $assignment->name,
                'source' => 'sdo',
                'role' => $assignment->role,
            ];
        }

        $station = Station::query()
            ->where('code', '!=', 'SDO')
            ->find($stationId);

        if (! $station) {
            return null;
        }

        return [
            'id' => $station->id,
            'station_id' => $station->id,
            'code' => $station->code,
            'name' => $station->name,
            'source' => 'station',
            'role' => 'school_admin',
        ];
    }

    public function resolveRemoveStationAdminModal(): ?array
    {
        if (request('modal') !== 'remove-station-admin') {
            return null;
        }

        $admin = StationAdmin::with([
            'employee:id,first_name,middle_name,last_name,position',
        ])->find(request('admin_id'));

        if (! $admin) {
            return null;
        }

        return [
            'id' => $admin->id,
            'employee_name' => $this->formatEmployeeName($admin->employee),
        ];
    }

    public function formatEmployeeName(?Employee $employee): string
    {
        if (! $employee) {
            return 'Station Admin';
        }

        $name = preg_replace(
            '/\s+/',
            ' ',
            trim("{$employee->first_name} {$employee->middle_name} {$employee->last_name}"),
        );

        return $name !== '' ? $name : 'Station Admin';
    }
}
