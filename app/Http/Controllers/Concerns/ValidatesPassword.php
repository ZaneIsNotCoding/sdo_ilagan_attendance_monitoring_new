<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

trait ValidatesPassword
{
    protected function ensureValidPassword(Request $request): void
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (! Hash::check($request->password, auth()->user()->password)) {
            throw ValidationException::withMessages([
                'password' => 'Wrong password. Please try again.',
            ]);
        }
    }
}
