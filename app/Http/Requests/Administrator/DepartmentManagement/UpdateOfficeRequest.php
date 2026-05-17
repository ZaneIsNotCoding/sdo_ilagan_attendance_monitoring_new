<?php

namespace App\Http\Requests\Administrator\DepartmentManagement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOfficeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'division_id' => 'required|exists:divisions,id',
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('offices', 'name')
                    ->where(function ($query) {
                        return $query->where('division_id', $this->division_id);
                    })
                    ->ignore($this->route('id')),
            ],
        ];
    }
}
