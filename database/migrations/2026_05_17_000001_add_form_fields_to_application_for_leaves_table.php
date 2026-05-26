<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('application_for_leaves', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->foreignId('employee_id')->nullable()->change();
            $table->foreign('employee_id')->references('id')->on('employees')->nullOnDelete();

            if (! Schema::hasColumn('application_for_leaves', 'employee_name')) {
                $table->string('employee_name')->nullable()->after('employee_id');
            }

            if (! Schema::hasColumn('application_for_leaves', 'office_department')) {
                $table->string('office_department')->nullable()->after('employee_name');
            }

            if (! Schema::hasColumn('application_for_leaves', 'date_of_filing')) {
                $table->date('date_of_filing')->nullable()->after('office_department');
            }

            if (! Schema::hasColumn('application_for_leaves', 'position')) {
                $table->string('position')->nullable()->after('date_of_filing');
            }

            if (! Schema::hasColumn('application_for_leaves', 'salary')) {
                $table->string('salary')->nullable()->after('position');
            }

            if (! Schema::hasColumn('application_for_leaves', 'type_of_leave_other')) {
                $table->string('type_of_leave_other')->nullable()->after('type_of_leave');
            }

            if (! Schema::hasColumn('application_for_leaves', 'leave_location')) {
                $table->string('leave_location')->nullable()->after('type_of_leave_other');
            }

            if (! Schema::hasColumn('application_for_leaves', 'leave_location_details')) {
                $table->string('leave_location_details')->nullable()->after('leave_location');
            }

            if (! Schema::hasColumn('application_for_leaves', 'sick_leave_location')) {
                $table->string('sick_leave_location')->nullable()->after('leave_location_details');
            }

            if (! Schema::hasColumn('application_for_leaves', 'illness')) {
                $table->string('illness')->nullable()->after('sick_leave_location');
            }

            if (! Schema::hasColumn('application_for_leaves', 'women_illness')) {
                $table->string('women_illness')->nullable()->after('illness');
            }

            if (! Schema::hasColumn('application_for_leaves', 'study_leave_purpose')) {
                $table->string('study_leave_purpose')->nullable()->after('women_illness');
            }

            if (! Schema::hasColumn('application_for_leaves', 'other_purpose')) {
                $table->string('other_purpose')->nullable()->after('study_leave_purpose');
            }

            if (! Schema::hasColumn('application_for_leaves', 'working_days')) {
                $table->decimal('working_days', 5, 2)->nullable()->after('other_purpose');
            }

            if (! Schema::hasColumn('application_for_leaves', 'inclusive_dates')) {
                $table->string('inclusive_dates')->nullable()->after('working_days');
            }

            if (! Schema::hasColumn('application_for_leaves', 'commutation')) {
                $table->string('commutation')->nullable()->after('inclusive_dates');
            }

            if (! Schema::hasColumn('application_for_leaves', 'created_at')) {
                $table->timestamps();
            }
        });
    }

    public function down(): void
    {
        Schema::table('application_for_leaves', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->foreignId('employee_id')->nullable(false)->change();
            $table->foreign('employee_id')->references('id')->on('employees')->cascadeOnDelete();

            $table->dropColumn([
                'employee_name',
                'office_department',
                'date_of_filing',
                'position',
                'salary',
                'type_of_leave_other',
                'leave_location',
                'leave_location_details',
                'sick_leave_location',
                'illness',
                'women_illness',
                'study_leave_purpose',
                'other_purpose',
                'working_days',
                'inclusive_dates',
                'commutation',
            ]);
        });
    }
};
