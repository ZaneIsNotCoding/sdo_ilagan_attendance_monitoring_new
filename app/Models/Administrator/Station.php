<?php

namespace App\Models\Administrator;

use App\Models\Administrator\Employee;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Station extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}