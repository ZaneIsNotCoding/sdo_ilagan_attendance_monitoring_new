<?php

namespace App\Services\Administrator\DailyTimeRecord\Concerns;

use App\Models\Administrator\TardinessRecord;

trait ComputesTardinessRecords
{
    private const DEFAULT_START_MINUTES = 8 * 60;
    private const DEFAULT_END_MINUTES = 17 * 60;
    private const LUNCH_START_MINUTES = 12 * 60;
    private const PM_START_MINUTES = 13 * 60;
    private const REQUIRED_WORK_MINUTES = 8 * 60;
    private const LUNCH_BREAK_MINUTES = 60;

    private function attendanceTimes($attendance): array
    {
        return [
            'amIn' => $attendance->am?->am_time_in,
            'amOut' => $attendance->am?->am_time_out,
            'pmIn' => $attendance->pm?->pm_time_in,
            'pmOut' => $attendance->pm?->pm_time_out,
        ];
    }

    private function scheduledStartMinutes($attendance): int
    {
        return $this->timeToMinutes(
            $attendance->employee?->workSchedule?->time_in,
            self::DEFAULT_START_MINUTES,
        );
    }

    private function scheduledEndMinutes($attendance): int
    {
        return $this->timeToMinutes(
            $attendance->employee?->workSchedule?->time_out,
            self::DEFAULT_END_MINUTES,
        );
    }

    private function tardyAfter(?string $time, int $expectedMinutes): int
    {
        if (! $time) {
            return 0;
        }

        return max(0, $this->timeToMinutes($time) - $expectedMinutes);
    }

    private function undertimeBefore(?string $time, int $expectedMinutes): int
    {
        if (! $time) {
            return 0;
        }

        return max(0, $expectedMinutes - $this->timeToMinutes($time));
    }

    private function timeToMinutes(?string $time, int $default = 0): int
    {
        if (! $time) {
            return $default;
        }

        [$hour, $minute] = sscanf($time, '%d:%d');

        return ((int) $hour * 60) + (int) $minute;
    }

    private function minutesToTime(int $minutes): string
    {
        return gmdate('H:i:s', $minutes * 60);
    }

    private function minutesToDecimalHours(int $minutes): float
    {
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        return (float) sprintf('%d.%02d', $hours, $remainingMinutes);
    }

    private function saveTardinessRecord(
        $attendance,
        int $amTardy,
        int $pmTardy,
        int $undertime,
    ): void {
        $totalMinutes = $amTardy + $pmTardy + $undertime;

        TardinessRecord::updateOrCreate(
            [
                'employee_id' => $attendance->employee_id,
                'attendance_id' => $attendance->id,
                'date' => $attendance->date,
            ],
            [
                'am_tardy' => $this->minutesToTime($amTardy),
                'pm_tardy' => $this->minutesToTime($pmTardy),
                'undertime' => $this->minutesToTime($undertime),
                'total_tardy' => $this->minutesToTime($totalMinutes),
                'converted_tardy' => $this->minutesToDecimalHours($totalMinutes),
            ],
        );
    }
}
