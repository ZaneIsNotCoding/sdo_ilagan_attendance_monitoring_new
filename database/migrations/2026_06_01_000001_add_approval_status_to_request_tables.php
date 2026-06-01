<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['locator_slips', 'travel_orders', 'application_for_leaves'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                if (! Schema::hasColumn($table->getTable(), 'status')) {
                    $table->string('status', 20)->default('pending')->after('employee_id');
                }

                if (! Schema::hasColumn($table->getTable(), 'approved_by')) {
                    $table->foreignId('approved_by')->nullable()->after('status')
                        ->constrained('users')->nullOnDelete();
                }

                if (! Schema::hasColumn($table->getTable(), 'approved_at')) {
                    $table->timestamp('approved_at')->nullable()->after('approved_by');
                }
            });
        }
    }

    public function down(): void
    {
        foreach (['locator_slips', 'travel_orders', 'application_for_leaves'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                if (Schema::hasColumn($table->getTable(), 'approved_by')) {
                    $table->dropConstrainedForeignId('approved_by');
                }

                if (Schema::hasColumn($table->getTable(), 'approved_at')) {
                    $table->dropColumn('approved_at');
                }

                if (Schema::hasColumn($table->getTable(), 'status')) {
                    $table->dropColumn('status');
                }
            });
        }
    }
};
