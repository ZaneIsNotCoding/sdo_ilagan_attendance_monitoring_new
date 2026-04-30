<?php

namespace Database\Seeders;

use App\Models\Administrator\Office;
use App\Models\Division;
use Illuminate\Database\Seeder;

class OfficeSeeder extends Seeder
{
    public function run(): void
    {
        $divisions = Division::query()->pluck('id', 'code');

        $offices = [
            'CID' => [
                'Instructional Management',
                'Learning Resource Management',
            ],
            'OSDS' => [
                'Administrative Unit',
                'Cash Unit',
                'Budget Unit',
                'Accounting Unit',
                'Records Unit',
                'HRMO',
                'SDS Office',
                'ICT Unit',
                'Supply Unit',
            ],
            'SGOD' => [
                'Planning and Research Unit',
                'DRRM Unit',
                'Health and Nutrition Unit',
            ],
        ];

        foreach ($offices as $divisionCode => $officeNames) {
            $divisionId = $divisions->get($divisionCode);

            if (! $divisionId) {
                continue;
            }

            foreach ($officeNames as $officeName) {
                Office::updateOrCreate(
                    [
                        'division_id' => $divisionId,
                        'name' => $officeName,
                    ],
                    []
                );
            }
        }
    }
}
