<?php

namespace App\Http\Requests\Administrator\StationManagement;

use Illuminate\Foundation\Http\FormRequest;

class StationEmployeeCandidateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'station_id' => ['required', 'integer', 'exists:stations,id'],
            'search' => ['nullable', 'string', 'max:255'],
        ];
    }
}
