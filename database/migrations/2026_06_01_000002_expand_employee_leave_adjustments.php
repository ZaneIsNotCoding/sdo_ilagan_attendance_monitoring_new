<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE employee_leaves MODIFY leave_type ENUM('SL','VL','OB','LS','TO') NOT NULL DEFAULT 'SL'");
        }

        Schema::table('employee_leaves', function (Blueprint $table) {
            if (! Schema::hasColumn('employee_leaves', 'source_type')) {
                $table->string('source_type')->nullable()->after('leave_type');
            }

            if (! Schema::hasColumn('employee_leaves', 'source_id')) {
                $table->unsignedBigInteger('source_id')->nullable()->after('source_type');
            }

            if (! Schema::hasColumn('employee_leaves', 'remarks')) {
                $table->string('remarks')->nullable()->after('source_id');
            }

            $table->index(['source_type', 'source_id'], 'employee_leaves_source_index');
        });
    }

    public function down(): void
    {
        Schema::table('employee_leaves', function (Blueprint $table) {
            $table->dropIndex('employee_leaves_source_index');

            foreach (['source_type', 'source_id', 'remarks'] as $column) {
                if (Schema::hasColumn('employee_leaves', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE employee_leaves MODIFY leave_type ENUM('SL','VL','OB') NOT NULL DEFAULT 'SL'");
        }
    }
};
