<?php

namespace App\Http\Requests\Administrator\StationManagement;

use App\Models\Administrator\Employee;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStationAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employee = Employee::find($this->input('employee_id'));
        $existingUser = $employee
            ? User::where('employee_id', $employee->id)->first()
            : null;

        return [
            'employee_id' => ['required', 'exists:employees,id'],
            'station_id' => ['required', 'exists:stations,id'],
            'role' => ['required', 'in:school_admin,sdo_admin,sdo_hr'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($existingUser?->id),
            ],
            'password' => [
                'required',
                'string',
                'min:6',
                'confirmed',
                'regex:/[A-Z]/',
                'regex:/\d/',
            ],
        ];
    }
}
