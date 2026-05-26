<?php

namespace App\Http\Requests\Administrator\Employeemanagement;

class UpdateEmployeeRequest extends StoreEmployeeRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'active_status' => 'required|boolean',
        ];
    }
}
