<?php

namespace App\Http\Requests\Administrator\DepartmentManagement;

use Illuminate\Foundation\Http\FormRequest;

class StoreDivisionHeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'division_id' => 'required|exists:divisions,id',
            'employee_id' => 'required|exists:employees,id',
        ];
    }
}
