<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Candidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidate_number',
        'name',
        'gender',
        'image_url',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all scores for this candidate
     */
    public function scores(): HasMany
    {
        return $this->hasMany(Score::class);
    }

    /**
     * Get average score for a specific category
     */
    public function getAverageScore(string $category): float
    {
        return $this->scores()
            ->where('category', $category)
            ->avg('score') ?? 0;
    }

    /**
     * Get total weighted score
     */
    public function getTotalScore(): float
    {
        $production = $this->getAverageScore('production');
        $formal_attire = $this->getAverageScore('formal_attire');
        $uniform_attire = $this->getAverageScore('uniform_attire');
        $ethnic_attire = $this->getAverageScore('ethnic_attire');
        $gown = $this->getAverageScore('gown');

        $categoriesCount = 0;
        if ($production > 0) $categoriesCount++;
        if ($formal_attire > 0) $categoriesCount++;
        if ($uniform_attire > 0) $categoriesCount++;
        if ($ethnic_attire > 0) $categoriesCount++;
        if ($gown > 0) $categoriesCount++;

        return $categoriesCount > 0 ? ($production + $formal_attire + $uniform_attire + $ethnic_attire + $gown) / $categoriesCount : 0;
    }

    /**
     * Get total score excluding Q&A category (for Q&A finals qualification)
     */
    public function getTotalScoreExcludingQA(): float
    {
        $production = $this->getAverageScore('production');
        $formal_attire = $this->getAverageScore('formal_attire');
        $uniform_attire = $this->getAverageScore('uniform_attire');
        $ethnic_attire = $this->getAverageScore('ethnic_attire');
        $gown = $this->getAverageScore('gown');

        // Count only categories that have scores (excluding Q&A)
        $categoriesCount = 0;
        $totalScore = 0;

        if ($production > 0) {
            $categoriesCount++;
            $totalScore += $production;
        }
        if ($formal_attire > 0) {
            $categoriesCount++;
            $totalScore += $formal_attire;
        }
        if ($uniform_attire > 0) {
            $categoriesCount++;
            $totalScore += $uniform_attire;
        }

        if ($ethnic_attire > 0) {
            $categoriesCount++;
            $totalScore += $ethnic_attire;
        }
        if ($gown > 0) {
            $categoriesCount++;
            $totalScore += $gown;
        }

        return $categoriesCount > 0 ? $totalScore / $categoriesCount : 0;
    }

    /**
     * Get scores breakdown
     */
    public function getScoresBreakdown(): array
    {
        return [
            'production' => $this->getAverageScore('production'),
            'formal_attire' => $this->getAverageScore('formal_attire'),
            'uniform_attire' => $this->getAverageScore('uniform_attire'),
            'ethnic_attire' => $this->getAverageScore('ethnic_attire'),
            'gown' => $this->getAverageScore('gown'),
            'qa' => $this->getAverageScore('qa'),
            'overall_total' => $this->getTotalScore()
        ];
    }
}

