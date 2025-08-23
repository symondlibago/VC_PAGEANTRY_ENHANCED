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
        Schema::create('scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('judge_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('candidate_id')->constrained('candidates')->onDelete('cascade');
            $table->enum('category', [
            'production',
            'headress',
            'sports_attire',
            'casual_attire', 
            'opening_speech', 
            'swimsuit',
            'gown', 
            'qa']);
            $table->decimal('score', 5, 2); // Max 999.99
            $table->timestamps();
            
            // Ensure one score per judge per candidate per category
            $table->unique(['judge_id', 'candidate_id', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scores');
    }
};

