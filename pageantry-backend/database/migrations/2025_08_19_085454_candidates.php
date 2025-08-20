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
        Schema::table('candidates', function (Blueprint $table) {
            // Add composite unique constraint for candidate_number + gender
            $table->unique(['candidate_number', 'gender'], 'candidates_number_gender_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            // Drop the composite unique constraint
            $table->dropUnique('candidates_number_gender_unique');
        });
    }
};

