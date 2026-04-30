<?php

namespace Database\Seeders;

use App\Models\Administrator\DivisionHead;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Office;
use App\Models\Administrator\Station;
use App\Models\Administrator\StationAdmin;
use App\Models\Division;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            Convertion::class,
            StationSeeder::class,
            StationAssignmentSeeder::class,
            DivisionSeeder::class,
            OfficeSeeder::class,
        ]);

        Role::firstOrCreate(['name' => 'sdo_admin']);
        Role::firstOrCreate(['name' => 'sdo_hr']);
        Role::firstOrCreate(['name' => 'school_admin']);

        $divisions = Division::all();
        $offices = Office::all();
        $stations = Station::all();

        foreach ($stations as $station) {
            if ($station->id == 1) {
                $adminEmployee = Employee::create([
                    'station_id' => $station->id,
                    'first_name' => fake()->firstName(),
                    'middle_name' => fake()->lastName(),
                    'last_name' => fake()->lastName(),
                    'position' => 'Administrator',
                    'office_id' => $offices->where('name', 'Administrative Unit')->first()?->id,
                    'work_type' => 'Full',
                ]);

                $adminUser = User::create([
                    'email' => 'admin_' . Str::random(5) . '@mail.com',
                    'password' => Hash::make('123'),
                    'employee_id' => $adminEmployee->id,
                ]);
                $adminUser->assignRole('sdo_admin');

                StationAdmin::create([
                    'employee_id' => $adminEmployee->id,
                    'type' => 'sdo_admin',
                ]);

                $hrEmployee = Employee::create([
                    'station_id' => $station->id,
                    'first_name' => fake()->firstName(),
                    'middle_name' => fake()->lastName(),
                    'last_name' => fake()->lastName(),
                    'position' => 'HR',
                    'office_id' => $offices->where('name', 'HRMO')->first()?->id,
                    'work_type' => 'Full',
                ]);

                $hrUser = User::create([
                    'email' => 'hr_' . Str::random(5) . '@mail.com',
                    'password' => Hash::make('123'),
                    'employee_id' => $hrEmployee->id,
                ]);
                $hrUser->assignRole('sdo_hr');

                StationAdmin::create([
                    'employee_id' => $hrEmployee->id,
                    'type' => 'sdo_hr',
                ]);

                foreach ($divisions as $division) {
                    $employee = Employee::create([
                        'station_id' => $station->id,
                        'first_name' => fake()->firstName(),
                        'middle_name' => fake()->lastName(),
                        'last_name' => fake()->lastName(),
                        'position' => 'Division Head',
                        'office_id' => $offices->where('division_id', $division->id)->first()?->id,
                        'work_type' => 'Full',
                    ]);

                    DivisionHead::create([
                        'division_id' => $division->id,
                        'employee_id' => $employee->id,
                        'type' => 'division_head',
                    ]);
                }
            } else {
                $schoolAdminEmployee = Employee::create([
                    'station_id' => $station->id,
                    'first_name' => fake()->firstName(),
                    'middle_name' => fake()->lastName(),
                    'last_name' => fake()->lastName(),
                    'position' => 'School Administrator',
                    'office_id' => null,
                    'work_type' => 'Full',
                ]);

                $schoolAdminUser = User::create([
                    'email' => 'school_' . $station->id . '_' . Str::random(5) . '@mail.com',
                    'password' => Hash::make('123'),
                    'employee_id' => $schoolAdminEmployee->id,
                ]);
                $schoolAdminUser->assignRole('school_admin');

                StationAdmin::create([
                    'employee_id' => $schoolAdminEmployee->id,
                    'type' => 'school_admin',
                ]);
            }

            Employee::factory()->create([
                'station_id' => $station->id,
                'office_id' => $station->id == 1
                    ? $offices->random()?->id
                    : null,
            ]);
        }

        Position::factory()->count(20)->create();
    }
}
