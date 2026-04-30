<?php

namespace Database\Seeders;

use App\Models\Administrator\Station;
use App\Models\Administrator\StationAssignment;
use Illuminate\Database\Seeder;

class StationAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        $sdoStation = Station::where('code', 'SDO')
            ->orWhere('id', 1)
            ->orderBy('id')
            ->first();

        if (! $sdoStation) {
            return;
        }

        $assignments = [
            [
                'code' => 'SDO-AO',
                'name' => 'Administrative Office',
                'role' => 'sdo_admin',
            ],
            [
                'code' => 'SDO-HRMO',
                'name' => 'Human Resource Management Office',
                'role' => 'sdo_hr',
            ],
        ];

        foreach ($assignments as $assignment) {
            StationAssignment::updateOrCreate(
                [
                    'role' => $assignment['role'],
                ],
                [
                    'station_id' => $sdoStation->id,
                    'code' => $assignment['code'],
                    'name' => $assignment['name'],
                ],
            );
        }
    }
}