<?php

namespace App\Models\Administrator;

use App\Models\Administrator\Employee;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentHeadandSchoolAdmin extends Model
{
    use HasFactory;

    protected $table = 'department_heads_and_school_admins';

    protected $fillable = [
        'employee_id',
        'type',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}