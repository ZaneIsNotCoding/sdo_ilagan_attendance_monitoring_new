<?php

namespace App\Http\Requests\Administrator\DepartmentManagement;

use Illuminate\Foundation\Http\FormRequest;

class DepartmentEmployeeCandidateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'office_id' => ['nullable', 'integer', 'exists:offices,id'],
            'division_id' => ['nullable', 'integer', 'exists:divisions,id'],
        ];
    }
}
