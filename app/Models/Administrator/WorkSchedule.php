<?php

namespace App\Models\Administrator;

use Illuminate\Database\Eloquent\Model;

class WorkSchedule extends Model
{
    protected $fillable = [
        'work_type_id',
        'name',
        'time_in',
        'time_out',
    ];

    public function workType()
    {
        return $this->belongsTo(WorkType::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
