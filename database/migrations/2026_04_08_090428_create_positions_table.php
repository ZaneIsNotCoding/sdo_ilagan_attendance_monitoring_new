<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('positions', function (Blueprint $table) {
                    $table->id();

                    // Basic Info
                    $table->string('position_name'); // e.g., Teacher I, Principal II
                    $table->string('position_code')->nullable(); // optional internal code

                    // Classification
                    $table->string('category')->nullable();
                    // Teaching, Non-Teaching, Administrative

                    $table->string('level')->nullable();
                    // Elementary, Secondary, Division, Regional

                    // Government Details
                    $table->integer('salary_grade')->nullable(); // SG level (e.g., 11, 13, 19)

                    // Hierarchy
                    $table->foreignId('parent_id')->nullable()->constrained('positions')->nullOnDelete();
                    // for hierarchy (e.g., Teacher -> Head Teacher -> Principal)

                    // Status
                    $table->enum('status', ['active', 'inactive'])->default('active');

                    // Optional Description
                    $table->text('description')->nullable();

                    $table->timestamps();
                });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};
