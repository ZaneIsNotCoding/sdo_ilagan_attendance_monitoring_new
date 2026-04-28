<?php

namespace Database\Seeders;

use App\Models\Position;
use App\Models\User;
use App\Models\Administrator\Station;
use App\Models\Department;
use App\Models\Administrator\Employee;
use App\Models\Administrator\DepartmentHeadAndSchoolAdmin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Database\Seeders\Convertion;
use Database\Seeders\MonthlySeeder;
use Database\Seeders\LeaveCardSeeder;
use Database\Seeders\StationSeeder;
use Database\Seeders\DepartmentSeeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            Convertion::class,
            StationSeeder::class,
            DepartmentSeeder::class,
        ]);

        // ✅ Roles
        Role::firstOrCreate(['name' => 'sdo_admin']);
        Role::firstOrCreate(['name' => 'sdo_hr']);
        Role::firstOrCreate(['name' => 'school_admin']);

        $departments = Department::all();
        $stations = Station::all();

        foreach ($stations as $station) {

            // =====================================================
            // 🏢 SDO MAIN OFFICE
            // =====================================================
            if ($station->id == 1) {

                // 🔹 SDO ADMIN
                $adminEmployee = Employee::create([
                    'station_id' => $station->id,
                    'first_name' => fake()->firstName(),
                    'middle_name' => fake()->lastName(),
                    'last_name' => fake()->lastName(),
                    'position' => 'Administrator',
                    'department_id' => $departments->where('name', 'ADMINISTRATIVE UNIT')->first()?->id,
                    'work_type' => 'Full',
                ]);

                $adminUser = User::create([
                    'email' => 'admin_' . Str::random(5) . '@mail.com',
                    'password' => Hash::make('123'),
                    'employee_id' => $adminEmployee->id,
                ]);

                $adminUser->assignRole('sdo_admin');

                DepartmentHeadAndSchoolAdmin::create([
                    'employee_id' => $adminEmployee->id,
                    'type' => 'sdo_admin',
                ]);

                // 🔹 SDO HR
                $hrEmployee = Employee::create([
                    'station_id' => $station->id,
                    'first_name' => fake()->firstName(),
                    'middle_name' => fake()->lastName(),
                    'last_name' => fake()->lastName(),
                    'position' => 'HR',
                    'department_id' => $departments->where('name', 'HRMO')->first()?->id,
                    'work_type' => 'Full',
                ]);

                $hrUser = User::create([
                    'email' => 'hr_' . Str::random(5) . '@mail.com',
                    'password' => Hash::make('123'),
                    'employee_id' => $hrEmployee->id,
                ]);

                $hrUser->assignRole('sdo_hr');

                DepartmentHeadAndSchoolAdmin::create([
                    'employee_id' => $hrEmployee->id,
                    'type' => 'sdo_hr',
                ]);

                // 🔹 Department Heads
                foreach ($departments as $department) {

                    $employee = Employee::create([
                        'station_id' => $station->id,
                        'first_name' => fake()->firstName(),
                        'middle_name' => fake()->lastName(),
                        'last_name' => fake()->lastName(),
                        'position' => 'Department Head',
                        'department_id' => $department->id,
                        'work_type' => 'Full',
                    ]);
                    
                    DepartmentHeadAndSchoolAdmin::create([
                        'employee_id' => $employee->id,
                        'type' => 'department_head',
                    ]);
                }
            }

            // =====================================================
            // 🏫 SCHOOLS
            // =====================================================
            else {

                $schoolAdminEmployee = Employee::create([
                    'station_id' => $station->id,
                    'first_name' => fake()->firstName(),
                    'middle_name' => fake()->lastName(),
                    'last_name' => fake()->lastName(),
                    'position' => 'School Administrator',
                    'department_id' => null,
                    'work_type' => 'Full',
                ]);

                $schoolAdminUser = User::create([
                    'email' => 'school_' . $station->id . '_' . Str::random(5) . '@mail.com',
                    'password' => Hash::make('123'),
                    'employee_id' => $schoolAdminEmployee->id,
                ]);

                $schoolAdminUser->assignRole('school_admin');

                DepartmentHeadAndSchoolAdmin::create([
                    'employee_id' => $schoolAdminEmployee->id,
                    'type' => 'school_admin',
                ]);
            }

            // =====================================================
            // 👤 EXTRA EMPLOYEE
            // =====================================================
            Employee::factory()->create([
                'station_id' => $station->id,
                'department_id' => $station->id == 1
                    ? $departments->random()?->id
                    : null,
            ]);
        }

        $this->call([
            MonthlySeeder::class,
            LeaveCardSeeder::class,
        ]);

        Position::factory()->count(20)->create();
    }
}