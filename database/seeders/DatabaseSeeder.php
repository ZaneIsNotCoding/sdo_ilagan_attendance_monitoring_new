<?php

namespace Database\Seeders;

use App\Models\Administrator\DivisionHead;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Office;
use App\Models\Administrator\Station;
use App\Models\Administrator\StationAdmin;
use App\Models\Division;
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
                    'position' =>  'Administrative Officer IV',
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
            }

            Employee::factory()
                ->count($station->id == 1 ? 50 : 20)
                ->state(fn () => [
                    'station_id' => $station->id,
                    'office_id' => $station->id == 1
                        ? $offices->random()?->id
                        : null,
                ])
                ->create();
        }
        $this->call([
            MonthlySeeder::class,
        ]);
    }
}