<?php

namespace Database\Seeders;

use App\Models\DepartmentHead;
use App\Models\Position;
use App\Models\User;
use App\Models\Station;
use App\Models\Administrator\Employee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Database\Seeders\Convertion;
use Database\Seeders\MonthlySeeder;
use Database\Seeders\LeaveCardSeeder;
use Database\Seeders\StationSeeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ✅ Base seeders
        $this->call([
            Convertion::class,
            StationSeeder::class,
        ]);

        // ✅ Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $staffRole = Role::firstOrCreate(['name' => 'staff']);

        // ✅ Get all stations
        $stations = Station::all();

        foreach ($stations as $station) {

            // 🔥 Department rule
            $department = $station->id == 1
                ? 'ADMINISTRATIVE UNIT'
                : 'Not Applicable';

            // 🔥 1 ADMIN PER STATION (with user)
            $adminEmployee = Employee::create([
                'station_id' => $station->id,
                'first_name' => fake()->firstName(),
                'middle_name' => fake()->lastName(),
                'last_name' => fake()->lastName(),
                'position' => 'Administrator',
                'department' => $department,
                'work_type' => 'Full',
            ]);

            $adminUser = User::create([
                'email' => 'admin_' . $station->id . '_' . Str::random(5) . '@mail.com',
                'password' => Hash::make('123'),
                'employee_id' => $adminEmployee->id,
            ]);

            $adminUser->assignRole($adminRole);

            // 🔥 2 EMPLOYEES PER STATION (NO USER)
            Employee::factory(1)->create([
                'station_id' => $station->id,
                'department' => $department,
            ]);
        }

        // ✅ Other seeders
        $this->call([
            MonthlySeeder::class,
            LeaveCardSeeder::class,

        ]);
        Position::factory()->count(20)->create();
    }
}
