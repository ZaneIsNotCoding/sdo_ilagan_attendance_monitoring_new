<?php

namespace App\Models\Administrator;

use App\Models\DepartmentHead;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\HumanResource\TardyConvertion;
use App\Models\Biometric;
use App\Models\User;
use App\Models\HumanResource\SickLeave;
use App\Models\HumanResource\VacationLeave;
use App\Models\Station;
use Database\Factories\EmployeeFactory;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'position',
        'department_id',
        'work_type',
        'active_status',
        'station_id',
        'civil_status',
        'gsis_policy_no',
        'entrance_to_duty',
        'tin_no',
        'employment_status',
        'unit',
        'national_reference_card_no',
    ];

    protected $appends = [
        'full_name',
        'is_department_head',
        'is_school_admin'
    ];

    protected static function newFactory()
    {
        return EmployeeFactory::new();
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function tardyConvertion()
    {
        return $this->hasMany(TardyConvertion::class, 'employee_id');
    }

    public function biometric()
    {
        return $this->hasOne(Biometric::class, 'employee_id');
    }

    public function sickLeaves()
    {
        return $this->hasMany(SickLeave::class);
    }

    public function vacationLeaves()
    {
        return $this->hasMany(VacationLeave::class);
    }
    
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    public function user()
    {
        return $this->hasOne(User::class);
    }

    // ============================
    // 🔥 FIXED ROLE SYSTEM
    // ============================

    public function roles()
    {
        return $this->hasMany(DepartmentHead::class, 'employee_id');
    }

    public function isDepartmentHead()
    {
        return $this->roles()
            ->where('type', 'department_head')
            ->exists();
    }

    public function isSchoolAdmin()
    {
        return $this->roles()
            ->where('type', 'school_admin')
            ->exists();
    }

    public function getIsDepartmentHeadAttribute()
    {
        return $this->isDepartmentHead();
    }

    public function getIsSchoolAdminAttribute()
    {
        return $this->isSchoolAdmin();
    }
}