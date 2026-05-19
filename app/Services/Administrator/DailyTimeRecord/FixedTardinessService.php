<?php

namespace App\Services\Administrator\DailyTimeRecord;

use App\Services\Administrator\DailyTimeRecord\Concerns\ComputesTardinessRecords;
use Carbon\Carbon;

class FixedTardinessService
{
    use ComputesTardinessRecords;

    public function __construct(
        private readonly int $flexAllowanceMinutes = 30,
    ) {}

    public function computeForAttendances($attendances): void
    {
        foreach ($attendances as $attendance) {
            $times = $this->attendanceTimes($attendance);
            $scheduleStart = $this->scheduledStartMinutes($attendance);
            $scheduleEnd = $this->scheduledEndMinutes($attendance);

            $amTardy = $this->calculateAmTardy(
                $times['amIn'],
                $attendance->date,
                $scheduleStart,
            );
            $pmTardy = $this->tardyAfter($times['pmIn'], self::PM_START_MINUTES);
            $amUndertime = $this->undertimeBefore(
                $times['amOut'],
                self::LUNCH_START_MINUTES,
            );
            $pmUndertime = $this->calculatePmUndertime(
                $times['amIn'],
                $times['pmOut'],
                $attendance->date,
                $scheduleStart,
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

    private function calculateAmTardy(
        ?string $amIn,
        string $date,
        int $scheduleStart,
    ): int {
        $lateMinutes = $this->tardyAfter($amIn, $scheduleStart);

        if ($lateMinutes === 0) {
            return 0;
        }

        if (Carbon::parse($date)->isMonday()) {
            return $lateMinutes;
        }

        return $lateMinutes <= $this->flexAllowanceMinutes
            ? 0
            : $lateMinutes;
    }

    private function calculatePmUndertime(
        ?string $amIn,
        ?string $pmOut,
        string $date,
        int $scheduleStart,
        int $scheduleEnd,
    ): int {
        if (! $pmOut) {
            return 0;
        }

        $expectedOut = $scheduleEnd;

        if ($amIn && ! Carbon::parse($date)->isMonday()) {
            $lateMinutes = $this->tardyAfter($amIn, $scheduleStart);

            if ($lateMinutes > 0 && $lateMinutes <= $this->flexAllowanceMinutes) {
                $expectedOut += $lateMinutes;
            }
        }

        return $this->undertimeBefore($pmOut, $expectedOut);
    }
}
