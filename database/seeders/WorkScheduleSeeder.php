<?php

namespace Database\Seeders;

use App\Models\Administrator\WorkSchedule;
use App\Models\Administrator\WorkType;
use Illuminate\Database\Seeder;

class WorkScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workTypes = WorkType::pluck('id', 'name');

        $schedules = [
            [
                'work_type_id' => $workTypes['Full'],
                'name' => '7:30 AM - 4:30 PM',
                'time_in' => '07:30:00',
                'time_out' => '16:30:00',
            ],
            [
                'work_type_id' => $workTypes['Full'],
                'name' => '8:00 AM - 5:00 PM',
                'time_in' => '08:00:00',
                'time_out' => '17:00:00',
            ],
            [
                'work_type_id' => $workTypes['Full'],
                'name' => '8:30 AM - 5:30 PM',
                'time_in' => '08:30:00',
                'time_out' => '17:30:00',
            ],
            [
                'work_type_id' => $workTypes['Fixed'],
                'name' => '8:00 AM - 5:00 PM',
                'time_in' => '08:00:00',
                'time_out' => '17:00:00',
            ],
            [
                'work_type_id' => $workTypes['Work From Home'],
                'name' => '8:00 AM - 5:00 PM',
                'time_in' => '08:00:00',
                'time_out' => '17:00:00',
            ],
        ];

        foreach ($schedules as $schedule) {
            WorkSchedule::firstOrCreate(
                [
                    'work_type_id' => $schedule['work_type_id'],
                    'name' => $schedule['name'],
                ],
                [
                    'time_in' => $schedule['time_in'],
                    'time_out' => $schedule['time_out'],
                ],
            );
        }
    }
}