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
            Schema::create('employees', function (Blueprint $table) {
                $table->id();
                $table->string('first_name');
                $table->string('middle_name')->nullable();
                $table->string('last_name');
                $table->string('profile_img')->nullable();
                $table->string('position');
                $table->foreignId('office_id')->nullable()->constrained('offices')->nullOnDelete();
                $table->string('work_type');
                $table->boolean('active_status')->default(true);
                $table->foreignId('station_id')->constrained('stations')->cascadeOnUpdate()->restrictOnDelete();

                // Extra details
                $table->string('civil_status')->nullable();
                $table->string('gsis_policy_no')->nullable();
                $table->date('entrance_to_duty')->nullable();
                $table->string('tin_no')->nullable();
                $table->string('employment_status')->nullable();
                $table->string('unit')->nullable();
                $table->string('national_reference_card_no')->nullable();

                $table->timestamps();
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('employees');
        }
    };
