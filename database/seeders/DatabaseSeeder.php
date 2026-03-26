<?php

namespace Database\Seeders;

use App\Models\DepartmentHead;
use App\Models\User;
use App\Models\Station;
use App\Models\Administrator\Employee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Database\Seeders\Convertion;
use Database\Seeders\MonthlySeeder;
use Database\Seeders\LeaveCardSeeder;
use Database\Seeders\StationSeeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            Convertion::class,
            StationSeeder::class,
        ]);

        $defaultStation = Station::first();

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $staff = Role::firstOrCreate(['name' => 'staff']);

        // STAFF USER
        $employee1 = Employee::create([
            'station_id' => 1,
            'first_name' => 'Reycarl',
            'middle_name' => 'Dela Cruz',
            'last_name' => 'Medico',
            'position' => 'Administrative Officer 5',
            'department' => 'ADMINISTRATIVE UNIT',
            'work_type' => 'Full',
        ]);

        $user1 = User::create([
            'email' => 'carl@gmail.com',
            'password' => Hash::make('123'),
            'employee_id' => $employee1->id,
        ]);

        $user1->assignRole($admin);

        Employee::factory(5)->create([
            'station_id' => Station::inRandomOrder()->first()->id,
        ])->each(function ($employee) use ($staff) {
            $user = User::create([
                'email' => strtolower($employee->first_name . $employee->id . '@mail.com'),
                'password' => Hash::make('123'),
                'employee_id' => $employee->id,
            ]);

            $user->assignRole($staff);
        });
        Employee::factory(5)->create([
            'station_id' => Station::inRandomOrder()->first()->id,
        ])->each(function ($employee) use ($staff) {
            $user = User::create([
                'email' => strtolower($employee->first_name . $employee->id . '@mail.com'),
                'password' => Hash::make('123'),
                'employee_id' => $employee->id,
            ]);

            $user->assignRole($staff);
        });

        // ADMIN USER
        $employee2 = Employee::create([
            'station_id' => 3,
            'first_name' => 'Xedric',
            'middle_name' => 'Baingan',
            'last_name' => 'Alejo',
            'position' => 'Administrative Officer 5',
            'department' => 'ICT',
            'work_type' => 'Full',
        ]);

        $user2 = User::create([
            'email' => 'xed@gmail.com',
            'password' => Hash::make('123'),
            'employee_id' => $employee2->id,
        ]);

        $user2->assignRole($admin);

        $employee3 = Employee::create([
            'station_id' => 2,
            'first_name' => 'Arnie',
            'middle_name' => 'L.', // change if needed
            'last_name' => 'Paril',
            'position' => 'Administrative Officer 5',
            'department' => 'ICT',
            'work_type' => 'Full',
        ]);

        $user3 = User::create([
            'email' => 'arnie@gmail.com',
            'password' => Hash::make('123'),
            'employee_id' => $employee3->id,
        ]);

        $user3->assignRole($admin);

        Employee::factory(5)->create([
            'station_id' => $defaultStation->id,
        ]);

        DepartmentHead::create([
            'department' => 'ict_unit',
            'employee_id' => $employee2->id,
            'status' => 'active',
        ]);

        $this->call([
            MonthlySeeder::class,
            LeaveCardSeeder::class,
        ]);
    }
}
