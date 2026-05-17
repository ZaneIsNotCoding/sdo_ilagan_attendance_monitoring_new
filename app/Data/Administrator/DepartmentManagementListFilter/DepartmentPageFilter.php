<?php

namespace App\Data\Administrator\DepartmentManagementListFilter;

use Illuminate\Http\Request;

class DepartmentPageFilter
{
    public function __construct(
        public readonly string $officeSearch,
        public readonly string $divisionSearch,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            officeSearch: trim((string) $request->query('office_search', $request->query('search', ''))),
            divisionSearch: trim((string) $request->query('division_search', '')),
        );
    }
}
