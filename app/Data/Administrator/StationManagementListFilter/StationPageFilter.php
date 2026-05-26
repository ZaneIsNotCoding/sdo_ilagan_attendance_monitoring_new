<?php

namespace App\Data\Administrator\StationManagementListFilter;

use Illuminate\Http\Request;

class StationPageFilter
{
    public const STATION_LIMITS = [5, 10, 25, 50];
    public const ADMIN_LIMITS = [10, 25, 50, 100];

    public function __construct(
        public readonly string $search,
        public readonly int $stationPage,
        public readonly int $adminPage,
        public readonly int $stationLimit,
        public readonly int $adminLimit,
    ) {}

    public static function fromRequest(Request $request): self
    {
        $stationLimit = (int) $request->query('station_limit', 5);
        $adminLimit = (int) $request->query('admin_limit', 10);

        return new self(
            search: trim((string) $request->query('search', '')),
            stationPage: max((int) $request->query('station_page', 1), 1),
            adminPage: max((int) $request->query('admin_page', 1), 1),
            stationLimit: in_array($stationLimit, self::STATION_LIMITS, true) ? $stationLimit : 5,
            adminLimit: in_array($adminLimit, self::ADMIN_LIMITS, true) ? $adminLimit : 10,
        );
    }

    public function hasInvalidLimits(Request $request): bool
    {
        return (string) $request->query('station_limit') !== (string) $this->stationLimit ||
            (string) $request->query('admin_limit') !== (string) $this->adminLimit;
    }
}
