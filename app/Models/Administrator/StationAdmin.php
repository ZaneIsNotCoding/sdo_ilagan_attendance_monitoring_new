<?php

namespace App\Models\Administrator;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StationAdmin extends Model
{
    use HasFactory;

    protected $table = 'station_admins';

    protected $fillable = [
        'employee_id',
        'type',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
