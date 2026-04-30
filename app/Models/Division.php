<?php

namespace App\Models;

use App\Models\Administrator\Office;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
    ];

    public function offices()
    {
        return $this->hasMany(Office::class);
    }
}
