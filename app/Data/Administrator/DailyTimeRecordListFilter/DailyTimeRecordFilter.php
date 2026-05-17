<?php

namespace App\Data\Administrator\DailyTimeRecordListFilter;

use Illuminate\Http\Request;

class DailyTimeRecordFilter
{
    public const LIMITS = [10, 25, 50, 100];

    public function __construct(
        public readonly int $stationId,
        public readonly string $search,
        public readonly string $officeName,
        public readonly int|string $officeId,
        public readonly int $month,
        public readonly int $year,
        public readonly int $limit,
    ) {}

    public static function fromRequest(Request $request, int $stationId): self
    {
        $limit = (int) $request->query('limit', 10);
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);

        return new self(
            stationId: $stationId,
            search: trim((string) $request->query('search', '')),
            officeName: trim((string) $request->query('office', 'all')),
            officeId: 'all',
            month: $month >= 1 && $month <= 12 ? $month : now()->month,
            year: $year >= 2000 && $year <= 2100 ? $year : now()->year,
            limit: in_array($limit, self::LIMITS, true) ? $limit : 10,
        );
    }

    public function hasInvalidLimit(Request $request): bool
    {
        return (string) $request->query('limit') !== (string) $this->limit;
    }

    public function withOfficeId(int|string $officeId): self
    {
        return new self(
            stationId: $this->stationId,
            search: $this->search,
            officeName: $this->officeName,
            officeId: $officeId,
            month: $this->month,
            year: $this->year,
            limit: $this->limit,
        );
    }
}
