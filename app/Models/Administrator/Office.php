<?php

namespace App\Models\Administrator;

use App\Models\Division;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Office extends Model
{
    use HasFactory;

    protected $fillable = [
        'division_id',
        'name',
    ];

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
