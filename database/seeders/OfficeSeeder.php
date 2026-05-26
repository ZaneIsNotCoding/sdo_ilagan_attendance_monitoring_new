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
                'CID',
            ],

            'OSDS' => [
                'Accounting Unit',
                'Budget Unit',
                'Administrative Unit',
                'Legal Unit',
                'Procurement Unit',
                'ICT Unit',
                'Supply and Property Unit',
                'Records Unit',
                'Human Resource Management Unit',
                'Cash Unit',
                'SDS',
                'ASDS',
                'General Services'
            ],

            'SGOD' => [
                'Planning and Research Unit',
                'DRRM Unit',
                'YFP Unit',
                'Health and Nutrition Unit',
                'Human Resource Development Unit',
                'School Management M&E Unit',
                'Education Facilities',
                'SGOD',
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
                    ]
                );
            }
        }
    }
}
