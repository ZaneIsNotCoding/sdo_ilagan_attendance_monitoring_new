<?php

namespace App\Services;

use App\Models\ApplicationForLeave;
use App\Models\EmployeeLeave;
use App\Models\LocatorSlip;
use App\Models\TravelOrder;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class DtrAdjustmentService
{
    public function syncFromLocatorSlip(LocatorSlip $locatorSlip): void
    {
        if (! $locatorSlip->employee_id || ! $locatorSlip->travel_datetime) {
            return;
        }

        $this->replaceSourceEntries(
            LocatorSlip::class,
            $locatorSlip->id,
            $locatorSlip->employee_id,
            [Carbon::parse($locatorSlip->travel_datetime)->toDateString()],
            'LS',
            $locatorSlip->purpose_of_travel,
        );
    }

    public function syncFromTravelOrder(TravelOrder $travelOrder): void
    {
        if (! $travelOrder->employee_id || ! $travelOrder->inclusive_dates) {
            return;
        }

        $this->replaceSourceEntries(
            TravelOrder::class,
            $travelOrder->id,
            $travelOrder->employee_id,
            $this->datesFromText($travelOrder->inclusive_dates),
            'TO',
            $travelOrder->purpose_of_travel,
        );
    }

    public function syncFromApplicationForLeave(ApplicationForLeave $application): void
    {
        if (! $application->employee_id || ! $application->inclusive_dates) {
            return;
        }

        $this->replaceSourceEntries(
            ApplicationForLeave::class,
            $application->id,
            $application->employee_id,
            $this->datesFromText($application->inclusive_dates),
            $this->leaveTypeCode($application->type_of_leave),
            $application->type_of_leave,
        );
    }

    public function removeSourceEntries(string $sourceType, int $sourceId): void
    {
        EmployeeLeave::where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->delete();
    }

    private function replaceSourceEntries(
        string $sourceType,
        int $sourceId,
        int $employeeId,
        array $dates,
        string $leaveType,
        ?string $remarks = null,
    ): void {
        $this->removeSourceEntries($sourceType, $sourceId);

        foreach (array_unique($dates) as $date) {
            EmployeeLeave::updateOrCreate(
                [
                    'employee_id' => $employeeId,
                    'date' => $date,
                ],
                [
                    'leave_type' => $leaveType,
                    'source_type' => $sourceType,
                    'source_id' => $sourceId,
                    'remarks' => $remarks,
                ],
            );
        }
    }

    private function datesFromText(string $value): array
    {
        $matches = [];
        preg_match_all('/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/', $value, $matches);

        $dates = collect($matches[0])
            ->map(fn (string $date) => Carbon::parse($date)->startOfDay())
            ->sort()
            ->values();

        if ($dates->count() >= 2 && preg_match('/(?:\b(?:to|until)\b|-)/i', $value)) {
            return collect(CarbonPeriod::create($dates->first(), $dates->last()))
                ->map(fn (Carbon $date) => $date->toDateString())
                ->all();
        }

        if ($dates->isEmpty()) {
            try {
                return [Carbon::parse($value)->toDateString()];
            } catch (\Throwable) {
                return [];
            }
        }

        return $dates
            ->map(fn (Carbon $date) => $date->toDateString())
            ->all();
    }

    private function leaveTypeCode(?string $leaveType): string
    {
        return str_contains(strtolower((string) $leaveType), 'sick') ? 'SL' : 'VL';
    }
}
