<?php

namespace App\Models\Administrator;

use Illuminate\Database\Eloquent\Model;

class WorkType extends Model
{
    protected $fillable = [
        'name',
    ];

    public function employees()
    {
        return $this->hasManyThrough(
            Employee::class,
            WorkSchedule::class,
            'work_type_id',
            'work_schedule_id',
        );
    }

    public function workSchedules()
    {
        return $this->hasMany(WorkSchedule::class);
    }
}
