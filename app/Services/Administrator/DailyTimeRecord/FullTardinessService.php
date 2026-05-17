<?php

namespace App\Services\Administrator\DailyTimeRecord;

use App\Models\Administrator\TardinessRecord;
use Carbon\Carbon;

class FullTardinessService
{
    protected $standardAmOut;   // 12:00 PM
    protected $standardPmIn;    // 1:00 PM
    protected $requiredWorkMinutes; // 8 hours
    protected $lunchBreakMinutes;   // 1 hour lunch

    public function __construct()
    {
        $this->standardAmOut = Carbon::createFromTime(12, 0, 0);
        $this->standardPmIn  = Carbon::createFromTime(13, 0, 0);
        $this->requiredWorkMinutes = 8 * 60; // 8 hours in minutes
        $this->lunchBreakMinutes   = 60;    // 1 hour lunch
    }

    public function computeForAttendances($attendances)
    {
        foreach ($attendances as $attendance) {
            $amIn  = $attendance->am?->am_time_in ? $attendance->am->am_time_in : null;
            $amOut = $attendance->am?->am_time_out ? $attendance->am->am_time_out : null;
            $pmIn  = $attendance->pm?->pm_time_in ? $attendance->pm->pm_time_in : null;
            $pmOut = $attendance->pm?->pm_time_out ? $attendance->pm->pm_time_out : null;

            $amUndertime = $this->calculateAmUndertime($amOut);
            $pmTardy     = $this->calculatePmTardy($pmIn);
            $pmUndertime = $this->calculatePmUndertime($amIn, $pmOut);

            $totalSeconds = ($amUndertime + $pmTardy + $pmUndertime) * 60;

            $this->saveRecord($attendance, $amUndertime, $pmTardy, $pmUndertime, $totalSeconds);
        }
    }

    // AM undertime in minutes
    private function calculateAmUndertime(?string $amOut): int
    {
        if (!$amOut) return 0;

        [$hour, $minute] = sscanf($amOut, "%d:%d");
        $amOutMinutes = $hour * 60 + $minute;
        $standardAmOutMinutes = 12 * 60;

        if ($amOutMinutes >= $standardAmOutMinutes) return 0;

        return max(0, $standardAmOutMinutes - $amOutMinutes);
    }

    // PM tardy in minutes
    private function calculatePmTardy(?string $pmIn): int
    {
        if (!$pmIn) return 0;

        [$hour, $minute] = sscanf($pmIn, "%d:%d");
        $pmInMinutes = $hour * 60 + $minute;
        $standardPmInMinutes = 13 * 60;

        if ($pmInMinutes <= $standardPmInMinutes) return 0;

        return max(0, $pmInMinutes - $standardPmInMinutes);
    }

    // PM undertime in minutes
    private function calculatePmUndertime(?string $amIn, ?string $pmOut): int
    {
        if (!$amIn || !$pmOut) return 0;

        [$amHour, $amMinute] = sscanf($amIn, "%d:%d");
        [$pmHour, $pmMinute] = sscanf($pmOut, "%d:%d");

        $amInMinutes = $amHour * 60 + $amMinute;
        $pmOutMinutes = $pmHour * 60 + $pmMinute;

        // Expected PM out = AM in + required work + lunch
        $expectedPmOut = $amInMinutes + $this->requiredWorkMinutes + $this->lunchBreakMinutes;

        if ($pmOutMinutes < $expectedPmOut) {
            return $expectedPmOut - $pmOutMinutes;
        }

        return 0;
    }

    private function saveRecord($attendance, int $amUndertime, int $pmTardy, int $pmUndertime, int $totalSeconds)
    {
        TardinessRecord::updateOrCreate(
            [
                'employee_id'   => $attendance->employee_id,
                'attendance_id' => $attendance->id,
                'date'          => $attendance->date,
            ],
            [
                'am_tardy'        => gmdate('H:i:s', 0),
                'pm_tardy'        => gmdate('H:i:s', $pmTardy * 60),
                'undertime'       => gmdate('H:i:s', ($amUndertime + $pmUndertime) * 60),
                'total_tardy'     => gmdate('H:i:s', $totalSeconds),
                'converted_tardy' => $this->convertToHoursDecimal($totalSeconds),
            ]
        );
    }

    private function convertToHoursDecimal(int $totalSeconds): float
    {
        $hours = floor($totalSeconds / 3600);
        $minutes = floor(($totalSeconds % 3600) / 60);
        return floatval(sprintf("%d.%02d", $hours, $minutes));
    }
}
