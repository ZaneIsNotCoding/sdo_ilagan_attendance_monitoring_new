<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Station;
use App\Models\Department;
use App\Models\Administrator\Employee;
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
        // ✅ Base seeders FIRST
        $this->call([
            Convertion::class,
            StationSeeder::class,
            DepartmentSeeder::class, // 👈 MUST BE FIRST
        ]);

        // ✅ Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $staffRole = Role::firstOrCreate(['name' => 'staff']);

        // ✅ Get departments
        $departments = Department::all();

        // ✅ Get stations
        $stations = Station::all();

        foreach ($stations as $station) {

            // 🔥 Station 1 = ADMIN, others = NOT APPLICABLE
            $department = $station->id == 1
                ? $departments->where('name', 'ADMINISTRATIVE UNIT')->first()
                : $departments->where('name', 'Not Applicable')->first();

            // 🔥 ADMIN employee
            $adminEmployee = Employee::create([
                'station_id' => $station->id,
                'first_name' => fake()->firstName(),
                'middle_name' => fake()->lastName(),
                'last_name' => fake()->lastName(),
                'position' => 'Administrator',
                'department_id' => $department->id,
                'work_type' => 'Full',
            ]);

            $adminUser = User::create([
                'email' => 'admin_' . $station->id . '_' . Str::random(5) . '@mail.com',
                'password' => Hash::make('123'),
                'employee_id' => $adminEmployee->id,
            ]);

            $adminUser->assignRole($adminRole);

            // 🔥 Employees
            Employee::factory(1)->create([
                'station_id' => $station->id,
                'department_id' => $department->id,
            ]);
        }

        // ✅ Other seeders LAST
        $this->call([
            MonthlySeeder::class,
            LeaveCardSeeder::class,
        ]);
    }
}