<?php

namespace App\Http\Requests\Administrator\DepartmentManagement;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDivisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $divisionId = $this->route('id');

        return [
            'code' => 'required|string|max:50|unique:divisions,code,' . $divisionId,
            'name' => 'required|string|max:255|unique:divisions,name,' . $divisionId,
        ];
    }
}
