<?php

namespace App\Http\Requests\Administrator\DepartmentManagement;

use Illuminate\Foundation\Http\FormRequest;

class StoreDivisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|max:50|unique:divisions,code',
            'name' => 'required|string|max:255|unique:divisions,name',
        ];
    }
}
