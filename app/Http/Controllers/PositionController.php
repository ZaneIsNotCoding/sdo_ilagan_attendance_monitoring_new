<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PositionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Position::query()
            ->select('id', 'position_name', 'category', 'level', 'salary_grade', 'status');

        if (request('search')) {
            $search = request('search');

            $query->where(function ($q) use ($search) {
                $q->where('position_name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('level', 'like', "%{$search}%")
                    ->orWhere('salary_grade', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            });
        }

        if (request('status')) {
            $query->where('status', request('status'));
        }

        if (request('category')) {
            $query->where('category', request('category'));
        }

        if (request('level')) {
            $query->where('level', request('level'));
        }

        $positions = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render("Admin/Position/Index", [
            "positions" => $positions,
            "queryParams" => request()->query(),
        ]);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'position_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'level' => ['required', 'string'],
            'salary_grade' => ['nullable', 'integer'],
        ]);

        try {
            $validated['status'] = 'active';

            Position::create($validated);

            return redirect()
                ->route('position.index')
                ->with('success', 'Position added successfully.');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to add position. Please try again.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'position_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'level' => ['required', 'string'],
            'salary_grade' => ['nullable', 'integer'],
        ]);

        try {
            $position = Position::findOrFail($id);

            $position->update($validated);

            return redirect()
                ->route('position.index')
                ->with('success', 'Position updated successfully.');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update position. Please try again.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Position $position)
    {
        $request->validate([
            'password' => ['required'],
        ]);

        if (!Hash::check($request->password, auth()->user()->password)) {
            return back()->withErrors([
                'password' => 'The provided password is incorrect.',
            ]);
        }

        $position->delete();

        return redirect()
            ->route('position.index')
            ->with('success', 'Position deleted successfully.');
    }
}
