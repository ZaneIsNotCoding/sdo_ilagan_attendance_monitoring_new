<?php

namespace App\Data\Administrator\StationManagementListFilter;

class StationEmployeeCandidateFilter
{
    public function __construct(
        public readonly int $stationId,
        public readonly string $search,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            stationId: (int) $data['station_id'],
            search: trim((string) ($data['search'] ?? '')),
        );
    }
}
