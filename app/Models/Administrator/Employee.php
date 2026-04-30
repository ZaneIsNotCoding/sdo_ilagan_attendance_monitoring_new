<?php

namespace App\Models\Administrator;

use App\Models\Biometric;
use App\Models\HumanResource\SickLeave;
use App\Models\HumanResource\TardyConvertion;
use App\Models\HumanResource\VacationLeave;
use App\Models\User;
use Database\Factories\EmployeeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'profile_img',
        'position',
        'office_id',
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
        'is_school_admin',
        'is_unit_head',
        'is_division_head',
        'department',
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

    public function getDepartmentAttribute()
    {
        return $this->office?->name;
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

    public function office()
    {
        return $this->belongsTo(Office::class);
    }

    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    public function user()
    {
        return $this->hasOne(User::class);
    }

    public function roles()
    {
        return $this->hasMany(DivisionHead::class, 'employee_id');
    }

    public function stationRoles()
    {
        return $this->hasMany(StationAdmin::class, 'employee_id');
    }

    public function isDepartmentHead()
    {
        return $this->roles()->where('type', 'unit_head')->exists();
    }

    public function isSchoolAdmin()
    {
        return $this->stationRoles()->where('type', 'school_admin')->exists();
    }

    public function isUnitHead()
    {
        return $this->roles()->where('type', 'unit_head')->exists();
    }

    public function isDivisionHead()
    {
        return $this->roles()->where('type', 'division_head')->exists();
    }

    public function getIsDepartmentHeadAttribute()
    {
        return $this->isDepartmentHead();
    }

    public function getIsSchoolAdminAttribute()
    {
        return $this->isSchoolAdmin();
    }

    public function getIsUnitHeadAttribute()
    {
        return $this->isUnitHead();
    }

    public function getIsDivisionHeadAttribute()
    {
        return $this->isDivisionHead();
    }
}
