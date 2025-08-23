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
        $headress = $this->getAverageScore('headress');
        $sportsAttire = $this->getAverageScore('sports_attire');
        $casualAttire = $this->getAverageScore('casual_attire');
        $openingSpeech = $this->getAverageScore('opening speech');
        $swimsuit = $this->getAverageScore('swimsuit');
        $gown = $this->getAverageScore('gown');

        $categoriesCount = 0;
        if ($production > 0) $categoriesCount++;
        if ($headress > 0) $categoriesCount++;
        if ($sportsAttire > 0) $categoriesCount++;
        if ($casualAttire > 0) $categoriesCount++;
        if ($openingSpeech > 0) $categoriesCount++;
        if ($swimsuit > 0) $categoriesCount++;
        if ($gown > 0) $categoriesCount++;

        return $categoriesCount > 0 ? ($production + $headress + $sportsAttire + $casualAttire + $openingSpeech + $swimsuit + $gown) / $categoriesCount : 0;
    }

    /**
     * Get scores breakdown
     */
    public function getScoresBreakdown(): array
    {
        return [
            'production' => $this->getAverageScore('production'),
            'headress' => $this->getAverageScore('headress'),
            'sports_attire' => $this->getAverageScore('sports_attire'),
            'casual_attire' => $this->getAverageScore('casual_attire'),
            'opening_speech' => $this->getAverageScore('opening_speech'),
            'swimsuit' => $this->getAverageScore('swimsuit'),
            'gown' => $this->getAverageScore('gown'),
            'qa' => $this->getAverageScore('qa'),
            'overall_total' => $this->getTotalScore()
        ];
    }
}

