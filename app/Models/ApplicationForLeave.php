<?php

namespace App\Models;

use App\Models\Administrator\Employee;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicationForLeave extends Model
{
    /** @use HasFactory<\Database\Factories\ApplicationForLeaveFactory> */
    use HasFactory;
    protected $table = 'application_for_leaves';

    protected $fillable = [
        'employee_id',
        'status',
        'approved_by',
        'approved_at',
        'employee_name',
        'office_department',
        'date_of_filing',
        'position',
        'salary',
        'type_of_leave',
        'type_of_leave_other',
        'leave_location',
        'leave_location_details',
        'sick_leave_location',
        'illness',
        'women_illness',
        'study_leave_purpose',
        'other_purpose',
        'working_days',
        'inclusive_dates',
        'commutation',
    ];

    protected $casts = [
        'date_of_filing' => 'date',
        'working_days' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
