<?php

namespace App\Models\Administrator;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StationAssignment extends Model
{
    /** @use HasFactory<\Database\Factories\StationAssignmentFactory> */
    use HasFactory;

     protected $fillable = [
        'station_id',
        'code',
        'name',
        'role',
    ];
}