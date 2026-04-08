<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $department_choices = [
            "Not Applicable",
            "CID",
            "SGOD",
            "HRMO",
            "ADMINISTRATIVE UNIT",
            "CASH UNIT",
            "BUDGET UNIT",
            "ACCOUNTING UNIT",
            "RECORDS UNIT",
            "SDS OFFICE",
            "ICT UNIT",
            "SUPPLY UNIT",
        ];

        foreach ($department_choices as $department) {
            Department::firstOrCreate([
                'name' => $department
            ]);
        }
    }
}