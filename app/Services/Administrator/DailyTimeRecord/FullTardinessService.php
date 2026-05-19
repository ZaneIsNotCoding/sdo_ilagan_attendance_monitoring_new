<?php

namespace App\Services\Administrator\DailyTimeRecord;

use App\Services\Administrator\DailyTimeRecord\Concerns\ComputesTardinessRecords;

class FullTardinessService
{
    use ComputesTardinessRecords;

    public function computeForAttendances($attendances): void
    {
        foreach ($attendances as $attendance) {
            $times = $this->attendanceTimes($attendance);
            $scheduleEnd = $this->scheduledEndMinutes($attendance);

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
                0,
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

        $expectedOut = $scheduleEnd;

        if ($amIn) {
            $expectedOut = max(
                $scheduleEnd,
                $this->timeToMinutes($amIn)
                    + self::REQUIRED_WORK_MINUTES
                    + self::LUNCH_BREAK_MINUTES,
            );
        }

        return $this->undertimeBefore($pmOut, $expectedOut);
    }
}
