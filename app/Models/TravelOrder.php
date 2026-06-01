<?php

namespace App\Models;

use App\Models\Administrator\Employee;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelOrder extends Model
{
    /** @use HasFactory<\Database\Factories\TravelOrderFactory> */
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
        'host_of_activity',
        'inclusive_dates',
        'destination',
        'fund_source',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
