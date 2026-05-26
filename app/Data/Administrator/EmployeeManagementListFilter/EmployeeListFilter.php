<?php

namespace App\Data\Administrator\EmployeeManagementListFilter;

use Illuminate\Http\Request;

class EmployeeListFilter
{
    public function __construct(
        public readonly int $stationId,
        public readonly string $search,
        public readonly string $status,
        public readonly string $officeName,
        public readonly int|string $officeId,
        public readonly int $limit,
    ) {}

    public static function fromRequest(Request $request, int $stationId): self
    {
        $status = $request->query('status', 'Active');

        if (! in_array($status, ['Active', 'Inactive'], true)) {
            $status = 'Active';
        }

        return new self(
            stationId: $stationId,
            search: trim((string) $request->query('search', '')),
            status: $status,
            officeName: trim((string) $request->query('office', 'all')),
            officeId: 'all',
            limit: self::limitFromRequest($request),
        );
    }

    public static function limitFromRequest(Request $request): int
    {
        $limit = (int) $request->query('limit', 10);

        return in_array($limit, [10, 25, 50, 100], true) ? $limit : 10;
    }

    public function withOfficeId(int|string $officeId): self
    {
        return new self(
            stationId: $this->stationId,
            search: $this->search,
            status: $this->status,
            officeName: $this->officeName,
            officeId: $officeId,
            limit: $this->limit,
        );
    }
}