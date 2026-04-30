<?php

namespace Database\Factories;

use App\Models\Administrator\Employee;
use App\Models\Administrator\Office;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Administrator\Employee>
 */
class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName,
            'middle_name' => $this->faker->optional()->firstName,
            'last_name' => $this->faker->lastName,
            'position' => $this->faker->randomElement([
                'Administrative Officer 1',
                'Administrative Officer 2',
                'Administrative Officer 3',
                'Administrative Officer 4',
                'Administrative Officer 5',
                'Senior Administrative Officer',
                'Junior Administrative Officer',
                'Executive Assistant',
                'Office Coordinator',
                'Administrative Manager',
                'Clerical Officer',
                'Records Officer',
                'HR Administrative Officer',
                'Office Assistant',
                'Operations Coordinator',
                'Administrative Clerk',
                'Program Assistant',
                'Data Entry Officer',
                'Receptionist',
                'Administrative Support Specialist',
                'Project Administrator',
            ]),
            'office_id' => Office::inRandomOrder()->first()?->id,
            'work_type' => $this->faker->randomElement(['Full', 'Fixed', 'Work From Home']),
            'active_status' => $this->faker->boolean(90),
            'civil_status' => $this->faker->optional()->randomElement(['Single', 'Married', 'Widowed']),
            'gsis_policy_no' => null,
            'entrance_to_duty' => null,
            'tin_no' => null,
            'employment_status' => null,
            'unit' => null,
            'national_reference_card_no' => null,
        ];
    }
}
