<?php

namespace App\Models;

use App\Models\Administrator\Employee;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocatorSlip extends Model
{
    /** @use HasFactory<\Database\Factories\LocatorSlipFactory> */
    use HasFactory;
    protected $fillable = [
        'employee_id',
        'status',
        'approved_by',
        'approved_at',
        'employee_name',
        'position',
        'permanent_station',
        'purpose_of_travel',
        'travel_type',
        'travel_datetime',
        'destination',
        'date_time',
    ];

    protected $casts = [
        'official_business' => 'boolean',
        'official_time' => 'boolean',
        'approved_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
