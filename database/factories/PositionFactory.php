<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Position;

class PositionFactory extends Factory
{
    protected $model = Position::class;

    public function definition(): array
    {
        $positions = [
            ['name' => 'Teacher I', 'category' => 'Teaching', 'sg' => 11],
            ['name' => 'Teacher II', 'category' => 'Teaching', 'sg' => 12],
            ['name' => 'Teacher III', 'category' => 'Teaching', 'sg' => 13],
            ['name' => 'Master Teacher I', 'category' => 'Teaching', 'sg' => 18],
            ['name' => 'Master Teacher II', 'category' => 'Teaching', 'sg' => 19],
            ['name' => 'Head Teacher I', 'category' => 'Teaching', 'sg' => 13],
            ['name' => 'Head Teacher II', 'category' => 'Teaching', 'sg' => 14],
            ['name' => 'Principal I', 'category' => 'Non-Teaching', 'sg' => 19],
            ['name' => 'Principal II', 'category' => 'Non-Teaching', 'sg' => 20],
            ['name' => 'Administrative Aide I', 'category' => 'Non-Teaching', 'sg' => 4],
            ['name' => 'Administrative Officer II', 'category' => 'Non-Teaching', 'sg' => 11],
        ];

        $selected = $this->faker->randomElement($positions);

        return [
            'position_name'   => $selected['name'],
            'position_code'   => strtoupper($this->faker->bothify('POS-###')),
            'category'        => $selected['category'],
            'level'           => $this->faker->randomElement(['School', 'Division', 'Regional']),
            'salary_grade'    => $selected['sg'],
            'parent_id'       => null, // set later if needed
            'status'          => $this->faker->randomElement(['active', 'inactive']),
            'description'     => $this->faker->sentence(),
        ];
    }
}
