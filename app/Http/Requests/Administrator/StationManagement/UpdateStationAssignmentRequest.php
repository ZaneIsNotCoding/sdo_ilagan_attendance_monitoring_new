<?php

namespace App\Http\Requests\Administrator\StationManagement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStationAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('station_assignments', 'code')->ignore($this->route('stationAssignment')?->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required'],
        ];
    }
}
