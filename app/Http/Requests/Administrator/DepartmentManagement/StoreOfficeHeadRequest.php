<?php

namespace App\Http\Requests\Administrator\DepartmentManagement;

use Illuminate\Foundation\Http\FormRequest;

class StoreOfficeHeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'office_id' => 'required|exists:offices,id',
        ];
    }
}
