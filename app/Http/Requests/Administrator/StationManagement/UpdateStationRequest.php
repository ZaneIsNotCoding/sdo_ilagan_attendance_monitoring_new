<?php

namespace App\Http\Requests\Administrator\StationManagement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('stations', 'code')->ignore($this->route('station')?->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required'],
        ];
    }
}
