<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    /**
     * Get all scores submitted by this judge
     */
    public function scores()
    {
        return $this->hasMany(Score::class, 'judge_id');
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is judge
     */
    public function isJudge(): bool
    {
        return $this->role === 'judge';
    }

    /**
     * Get judge's progress for a specific category
     */
    public function getJudgingProgress(string $category): array
    {
        $totalCandidates = Candidate::where('is_active', true)->count();
        $scoredCandidates = $this->scores()
            ->where('category', $category)
            ->count();

        return [
            'total' => $totalCandidates,
            'completed' => $scoredCandidates,
            'remaining' => $totalCandidates - $scoredCandidates,
            'percentage' => $totalCandidates > 0 ? round(($scoredCandidates / $totalCandidates) * 100, 2) : 0
        ];
    }
}
