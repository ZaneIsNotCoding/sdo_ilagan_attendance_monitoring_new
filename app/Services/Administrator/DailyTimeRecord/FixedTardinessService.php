<?php

namespace App\Services\Administrator\DailyTimeRecord;

use App\Services\Administrator\DailyTimeRecord\Concerns\ComputesTardinessRecords;

class FixedTardinessService
{
    use ComputesTardinessRecords;

    public function computeForAttendances($attendances): void
    {
        foreach ($attendances as $attendance) {
            $times = $this->attendanceTimes($attendance);

            $amTardy = $this->tardyAfter($times['amIn'], self::DEFAULT_START_MINUTES);
            $pmTardy = $this->tardyAfter($times['pmIn'], self::PM_START_MINUTES);
            $amUndertime = $this->undertimeBefore(
                $times['amOut'],
                self::LUNCH_START_MINUTES,
            );
            $pmUndertime = $this->undertimeBefore(
                $times['pmOut'],
                self::DEFAULT_END_MINUTES,
            );

            $this->saveTardinessRecord(
                $attendance,
                $amTardy,
                $pmTardy,
                $amUndertime + $pmUndertime,
            );
        }
    }
}
