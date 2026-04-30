<?php

namespace Database\Seeders;

use App\Models\Division;
use Illuminate\Database\Seeder;

class DivisionSeeder extends Seeder
{
    public function run(): void
    {
        $divisions = [
            ['code' => 'CID', 'name' => 'Curriculum Implementation Division'],
            ['code' => 'OSDS', 'name' => 'Office of the Schools Division Superintendent'],
            ['code' => 'SGOD', 'name' => 'School Governance and Operations Division'],
        ];

        foreach ($divisions as $division) {
            Division::updateOrCreate(
                ['code' => $division['code']],
                ['name' => $division['name']]
            );
        }
    }
}
