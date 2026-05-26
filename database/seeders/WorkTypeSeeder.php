<?php

namespace Database\Seeders;

use App\Models\Administrator\WorkType;
use Illuminate\Database\Seeder;

class WorkTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Full', 'Fixed', 'Work From Home'] as $name) {
            WorkType::firstOrCreate(['name' => $name]);
        }
    }
}
