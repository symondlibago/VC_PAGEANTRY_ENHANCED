<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Candidate;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@pageant.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // // Seed 5 Male Candidates
        // for ($i = 1; $i <= 5; $i++) {
        //     Candidate::create([
        //         'candidate_number' => (string)$i,
        //         'name' => "Candidate Number $i - Male",
        //         'gender' => 'male',
        //         'is_active' => true,
        //         'image_url' => null,
        //     ]);
        // }

        // // Seed 5 Female Candidates
        // for ($i = 1; $i <= 5; $i++) {
        //     Candidate::create([
        //         'candidate_number' => (string)$i,
        //         'name' => "Candidate Number $i - Female",
        //         'gender' => 'female',
        //         'is_active' => true,
        //         'image_url' => null,
        //     ]);
        // }
    }
}