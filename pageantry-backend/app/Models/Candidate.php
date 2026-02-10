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
        $swimwear = $this->getAverageScore('swimwear');
        $gown = $this->getAverageScore('gown');
        $qa_preliminary = $this->getAverageScore('qa_preliminary');

        $categoriesCount = 0;
        if ($production > 0) $categoriesCount++;
        if ($formal_attire > 0) $categoriesCount++;
        if ($uniform_attire > 0) $categoriesCount++;
        if ($swimwear > 0) $categoriesCount++;
        if ($gown > 0) $categoriesCount++;
        if ($qa_preliminary > 0) $categoriesCount++;

        return $categoriesCount > 0 ? ($production + $formal_attire + $uniform_attire + $swimwear + $gown + $qa_preliminary) / $categoriesCount : 0;   
    }

    /**
     * Get total score excluding Q&A category (for Q&A finals qualification)
     */
    public function getTotalScoreExcludingQA(): float
    {
        $production = $this->getAverageScore('production');
        $formal_attire = $this->getAverageScore('formal_attire');
        $uniform_attire = $this->getAverageScore('uniform_attire');
        $swimwear = $this->getAverageScore('swimwear');
        $gown = $this->getAverageScore('gown');
        $qa_preliminary = $this->getAverageScore('qa_preliminary');

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

        if ($swimwear > 0) {
            $categoriesCount++;
            $totalScore += $swimwear;
        }
        if ($gown > 0) {
            $categoriesCount++;
            $totalScore += $gown;
        }

        if ($qa_preliminary > 0) {
            $categoriesCount++;
            $totalScore += $qa_preliminary;
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
            'swimwear' => $this->getAverageScore('swimwear'),
            'gown' => $this->getAverageScore('gown'),
            'qa_preliminary' => $this->getAverageScore('qa_preliminary'),
            'qa' => $this->getAverageScore('qa'),
            'overall_total' => $this->getTotalScore()
        ];
    }
}

