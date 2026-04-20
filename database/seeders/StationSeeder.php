<?php

namespace Database\Seeders;

use App\Models\Administrator\Station;
use Illuminate\Database\Seeder;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;

class StationSeeder extends Seeder
{
    public function run(): void
    {
        $rows = Excel::toArray([], database_path('seeders/data/station.xlsx'))[0] ?? [];

        foreach ($rows as $i => $row) {
            if ($i === 0) {
                continue; // skip header
            }

            $code = trim((string) ($row[0] ?? ''));
            $name = trim((string) ($row[1] ?? ''));

            if ($code === '' && $name === '') {
                continue;
            }

            if ($code === '' || $name === '') {
                Log::warning('Skipping invalid station row', [
                    'row' => $i + 1,
                    'data' => $row,
                ]);
                continue;
            }

            Station::updateOrCreate(
                [
                    'code' => $code,
                ],
                [
                    'name' => $name,
                    'updated_at' => now('Asia/Manila'),
                    'created_at' => now('Asia/Manila'),
                ]
            );
        }
    }
}