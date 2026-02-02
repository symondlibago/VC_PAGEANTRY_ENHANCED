<?php

namespace App\Http\Controllers;

use App\Models\Score;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class ScoreController extends Controller
{
    /**
     * Display all scores (Admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Score::with(['judge', 'candidate']);

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->get('category'));
        }

        // Filter by judge
        if ($request->has('judge_id')) {
            $query->where('judge_id', $request->get('judge_id'));
        }

        // Filter by candidate
        if ($request->has('candidate_id')) {
            $query->where('candidate_id', $request->get('candidate_id'));
        }

        $scores = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $scores
        ]);
    }

    /**
     * Submit a score (Judge only)
     */
    public function store(Request $request): JsonResponse
    {
        $judge = $request->user();

        // Validate input
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'category' => 'required|in:production,formal_attire,uniform_attire,ethnic_attire,gown,qa',
            'score' => 'required|numeric|min:0|max:100',
        ]);

        // Check if judge is active
        if (!$judge->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your judge account is inactive. Please contact the administrator.'
            ], 403);
        }

        // Check if candidate exists and is active
        $candidate = Candidate::findOrFail($validated['candidate_id']);
        if (!$candidate->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot score inactive candidate'
            ], 400);
        }

        // Check if judge already scored this candidate in this category
        $existingScore = Score::where('judge_id', $judge->id)
            ->where('candidate_id', $validated['candidate_id'])
            ->where('category', $validated['category'])
            ->first();

        if ($existingScore) {
            return response()->json([
                'success' => false,
                'message' => 'You have already scored this candidate in this category. Scores cannot be modified once submitted.'
            ], 409); // Conflict status code
        }

        try {
            $score = Score::create([
                'judge_id' => $judge->id,
                'candidate_id' => $validated['candidate_id'],
                'category' => $validated['category'],
                'score' => round($validated['score'], 2), // Round to 2 decimal places
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Score submitted successfully',
                'data' => $score->load(['candidate'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit score. Please try again.'
            ], 500);
        }
    }

    /**
     * Get judge's scores
     */
    public function judgeScores(Request $request): JsonResponse
    {
        $judge = $request->user();
        
        $query = Score::where('judge_id', $judge->id)
            ->with(['candidate']);

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->get('category'));
        }

        $scores = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $scores
        ]);
    }

    /**
     * Get candidate's scores
     */
    public function candidateScores(Candidate $candidate): JsonResponse
    {
        $scores = Score::where('candidate_id', $candidate->id)
            ->with(['judge'])
            ->get()
            ->groupBy('category');

        $scoresBreakdown = $candidate->getScoresBreakdown();

        return response()->json([
            'success' => true,
            'data' => [
                'candidate' => $candidate,
                'scores_by_category' => $scores,
                'averages' => $scoresBreakdown
            ]
        ]);
    }

    /**
     * Get next candidate for judging
     */
    public function nextCandidate(Request $request): JsonResponse
    {
        $judge = $request->user();
        $category = $request->get('category', 'sports_attire');

        // Get candidates that haven't been scored by this judge in this category
        $nextCandidate = Candidate::where('is_active', true)
            ->whereDoesntHave('scores', function ($query) use ($judge, $category) {
                $query->where('judge_id', $judge->id)
                      ->where('category', $category);
            })
            ->orderBy('candidate_number')
            ->first();

        if (!$nextCandidate) {
            return response()->json([
                'success' => true,
                'message' => 'All candidates have been scored in this category',
                'data' => null
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'candidate' => $nextCandidate,
                'category' => $category,
                'progress' => $judge->getJudgingProgress($category)
            ]
        ]);
    }

    /**
     * Get analytics data
     */
    public function analytics(Request $request): JsonResponse
    {
        $category = $request->get('category');
        $gender = $request->get('gender');

        // Build query for candidates
        $query = Candidate::where('is_active', true);
        
        // Filter by gender if provided
        if ($gender && in_array($gender, ['male', 'female'])) {
            $query->where('gender', $gender);
        }

        if ($category) {
            // Get top candidates for specific category
            $candidates = $query->get()
                ->map(function ($candidate) use ($category) {
                    return [
                        'candidate' => $candidate,
                        'average_score' => $candidate->getAverageScore($category)
                    ];
                })
                ->sortByDesc('average_score')
                ->values();
        } else {
            // Get overall rankings - force fresh calculation
            $candidates = $query->get()
                ->map(function ($candidate) {
                    // Force fresh calculation by calling methods directly
                    $scoresBreakdown = $candidate->getScoresBreakdown();
                    $totalScore = $candidate->getTotalScore();
                    
                    return [
                        'candidate' => $candidate,
                        'overall_total' => $totalScore,
                        'scores_breakdown' => $scoresBreakdown
                    ];
                })
                ->sortByDesc('overall_total')
                ->values();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'category' => $category,
                'gender' => $gender,
                'rankings' => $candidates
            ]
        ]);
    }

    /**
     * Get voting progress summary
     */
    public function progress(): JsonResponse
    {
        $categories = ['production', 'formal_attire', 'uniform_attire', 'ethnic_attire', 'gown', 'qa'];
        $totalCandidates = Candidate::where('is_active', true)->count();
        $totalJudges = \App\Models\User::where('role', 'judge')
            ->where('is_active', true)
            ->count();

        $progress = [];

        foreach ($categories as $category) {
            $totalPossibleScores = $totalCandidates * $totalJudges;
            $submittedScores = Score::where('category', $category)->count();
            
            $progress[$category] = [
                'total_possible' => $totalPossibleScores,
                'submitted' => $submittedScores,
                'percentage' => $totalPossibleScores > 0 ? round(($submittedScores / $totalPossibleScores) * 100, 2) : 0
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_candidates' => $totalCandidates,
                'total_judges' => $totalJudges,
                'categories_progress' => $progress
            ]
        ]);
    }
}

