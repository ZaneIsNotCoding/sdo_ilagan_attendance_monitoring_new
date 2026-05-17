<?php

namespace App\Services\Administrator\DailyTimeRecord;

use App\Models\Administrator\TardinessRecord;
use Carbon\Carbon;

class FixedTardinessService
{
    protected $standardAmIn;
    protected $standardPmIn;
    protected $standardPmOut;
    protected $flexAllowanceMinutes;

    public function __construct($flexAllowanceMinutes = 30)
    {
        $this->standardAmIn = Carbon::createFromTime(8, 0, 0);
        $this->standardPmIn = Carbon::createFromTime(13, 0, 0);
        $this->standardPmOut = Carbon::createFromTime(17, 0, 0);
        $this->flexAllowanceMinutes = $flexAllowanceMinutes;
    }

    public function computeForAttendances($attendances)
    {
        foreach ($attendances as $attendance) {
            $amIn  = $attendance->am?->am_time_in;
            $pmIn  = $attendance->pm?->pm_time_in;
            $pmOut = $attendance->pm?->pm_time_out;
            $amOut = $attendance->am?->am_time_out;

            $amTardyMinutes      = $this->calculateAmTardy($amIn, $attendance->date);
            $pmTardyMinutes      = $this->calculatePmTardy($pmIn);
            $amUndertimeMinutes  = $this->calculateAmUndertime($amOut);
            $pmUndertimeMinutes  = $this->calculatePmUndertime($amIn, $pmOut, $attendance->date);

            $totalMinutes = $amTardyMinutes + $pmTardyMinutes + $amUndertimeMinutes + $pmUndertimeMinutes;
            $totalTardy = gmdate('H:i:s', $totalMinutes * 60);
            $convertedTardy = $this->convertToHoursDecimal($totalMinutes);

            $this->saveRecord(
                $attendance,
                $amTardyMinutes,
                $pmTardyMinutes,
                $amUndertimeMinutes + $pmUndertimeMinutes,
                $totalTardy,
                $convertedTardy
            );
        }
    }

    private function calculateAmTardy(?string $amIn, $date): int
    {
        if (!$amIn) return 0;

        [$hour, $minute] = sscanf($amIn, "%d:%d");
        $amInMinutes = $hour * 60 + $minute;

        $standardAmInMinutes = 8 * 60;
        $diffMinutes = max(0, $amInMinutes - $standardAmInMinutes);

        $dayOfWeek = Carbon::parse($date)->dayOfWeek;

        if ($diffMinutes === 0) return 0;
        if ($dayOfWeek === Carbon::MONDAY) return $diffMinutes;
        if ($diffMinutes <= $this->flexAllowanceMinutes) return 0;

        return $diffMinutes;
    }

    private function calculateAmUndertime(?string $amOut): int
    {
        if (!$amOut) return 0;

        [$hour, $minute] = sscanf($amOut, "%d:%d");
        $amOutMinutes = $hour * 60 + $minute;
        $standardAmOutMinutes = 12 * 60;

        if ($amOutMinutes >= $standardAmOutMinutes) return 0;

        return max(0, $standardAmOutMinutes - $amOutMinutes);
    }

    private function calculatePmTardy(?string $pmIn): int
    {
        if (!$pmIn) return 0;

        [$hour, $minute] = sscanf($pmIn, "%d:%d");
        $pmInMinutes = $hour * 60 + $minute;
        $standardPmInMinutes = 13 * 60;

        return max(0, $pmInMinutes - $standardPmInMinutes);
    }

    private function calculatePmUndertime(?string $amIn, ?string $pmOut, $date): int
    {
        if (!$amIn || !$pmOut) return 0;

        [$amHour, $amMinute] = sscanf($amIn, "%d:%d");
        [$pmHour, $pmMinute] = sscanf($pmOut, "%d:%d");

        $amInMinutes = $amHour * 60 + $amMinute;
        $pmOutMinutes = $pmHour * 60 + $pmMinute;

        $standardPmOutMinutes = 17 * 60;
        $diffMinutes = max(0, $amInMinutes - 8*60);

        // Case 1: Monday → check directly against PM out
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        if ($dayOfWeek === Carbon::MONDAY) {
            if ($pmOutMinutes < $standardPmOutMinutes) {
                return $standardPmOutMinutes - $pmOutMinutes;
            }
            return 0;
        }

        // Case 2: Tue–Fri → grace logic applies
        if ($diffMinutes > 0 && $diffMinutes <= $this->flexAllowanceMinutes) {
            $expectedOut = $standardPmOutMinutes + $diffMinutes;
            if ($pmOutMinutes < $expectedOut) {
                return $expectedOut - $pmOutMinutes;
            }
        }

        // Case 3: Beyond grace → check only against 5:00 PM
        if ($diffMinutes > $this->flexAllowanceMinutes) {
            if ($pmOutMinutes < $standardPmOutMinutes) {
                return $standardPmOutMinutes - $pmOutMinutes;
            }
        }

        return 0;
    }

    private function convertToHoursDecimal(int $totalMinutes): float
    {
        $hours = floor($totalMinutes / 60);
        $minutes = $totalMinutes % 60;
        return floatval(sprintf("%d.%02d", $hours, $minutes));
    }

    private function saveRecord($attendance, int $amTardy, int $pmTardy, int $undertime, string $totalTardy, float $convertedTardy)
    {
        TardinessRecord::updateOrCreate(
            [
                'employee_id'   => $attendance->employee_id,
                'attendance_id' => $attendance->id,
                'date'          => $attendance->date,
            ],
            [
                'am_tardy'        => gmdate('H:i:s', $amTardy * 60),
                'pm_tardy'        => gmdate('H:i:s', $pmTardy * 60),
                'undertime'       => gmdate('H:i:s', $undertime * 60),
                'total_tardy'     => $totalTardy,
                'converted_tardy' => $convertedTardy,
            ]
        );
    }
}
