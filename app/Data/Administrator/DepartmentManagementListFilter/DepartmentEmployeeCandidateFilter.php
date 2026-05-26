<?php

namespace App\Data\Administrator\DepartmentManagementListFilter;

class DepartmentEmployeeCandidateFilter
{
    public function __construct(
        public readonly string $search = '',
        public readonly ?int $officeId = null,
        public readonly ?int $divisionId = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            search: trim((string) ($data['search'] ?? '')),
            officeId: isset($data['office_id']) ? (int) $data['office_id'] : null,
            divisionId: isset($data['division_id']) ? (int) $data['division_id'] : null,
        );
    }
}
