<?php

namespace App\Services\Administrator\DailyTimeRecord;

use App\Services\Administrator\DailyTimeRecord\Concerns\ComputesTardinessRecords;
use Carbon\Carbon;

class FullTardinessService
{
    use ComputesTardinessRecords;

    public function computeForAttendances($attendances): void
    {
        foreach ($attendances as $attendance) {
            $times = $this->attendanceTimes($attendance);
            $scheduleStart = $this->scheduledStartMinutes($attendance);
            $scheduleEnd = $this->scheduledEndMinutes($attendance);
            $amTardyStart = $this->amTardyStartMinutes(
                $attendance->date,
                $scheduleStart,
            );

            $amTardy = $this->tardyAfter($times['amIn'], $amTardyStart);
            $amUndertime = $this->undertimeBefore(
                $times['amOut'],
                self::LUNCH_START_MINUTES,
            );
            $pmTardy = $this->tardyAfter($times['pmIn'], self::PM_START_MINUTES);
            $pmUndertime = $this->calculatePmUndertime(
                $times['amIn'],
                $times['pmOut'],
                $scheduleEnd,
            );

            $this->saveTardinessRecord(
                $attendance,
                $amTardy,
                $pmTardy,
                $amUndertime + $pmUndertime,
            );
        }
    }

    private function calculatePmUndertime(
        ?string $amIn,
        ?string $pmOut,
        int $scheduleEnd,
    ): int {
        if (! $pmOut) {
            return 0;
        }

        if (! $amIn) {
            return $this->undertimeBefore($pmOut, self::DEFAULT_END_MINUTES);
        }

        $expectedOut = $scheduleEnd;

        $expectedOut = min(
            $scheduleEnd,
            $this->timeToMinutes($amIn)
                + self::REQUIRED_WORK_MINUTES
                + self::LUNCH_BREAK_MINUTES,
        );

        return $this->undertimeBefore($pmOut, $expectedOut);
    }

    private function amTardyStartMinutes(string $date, int $scheduleStart): int
    {
        if (
            Carbon::parse($date)->isMonday()
            && $scheduleStart === (8 * 60) + 30
        ) {
            return self::DEFAULT_START_MINUTES;
        }

        return $scheduleStart;
    }
}
