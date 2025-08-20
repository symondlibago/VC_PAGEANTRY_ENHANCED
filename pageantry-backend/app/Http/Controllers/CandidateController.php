<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CandidateController extends Controller
{
    /**
     * Display a listing of candidates
     */
    public function index(Request $request): JsonResponse
    {
        $query = Candidate::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Filter by gender
        if ($request->has('gender') && in_array($request->get('gender'), ['male', 'female'])) {
            $query->where('gender', $request->get('gender'));
        }

        // Search by name or candidate number
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('candidate_number', 'like', "%{$search}%");
            });
        }

        $candidates = $query->orderBy('candidate_number')->get();

        // Add scores breakdown for each candidate
        $candidatesWithScores = $candidates->map(function ($candidate) {
            return [
                'id' => $candidate->id,
                'candidate_number' => $candidate->candidate_number,
                'name' => $candidate->name,
                'gender' => $candidate->gender,
                'image_url' => $candidate->image_url ? asset($candidate->image_url) : null,
                'is_active' => $candidate->is_active,
                'scores' => $candidate->getScoresBreakdown(),
                'created_at' => $candidate->created_at,
                'updated_at' => $candidate->updated_at,
            ];
        });
        

        return response()->json([
            'success' => true,
            'data' => $candidatesWithScores
        ]);
    }

    /**
     * Store a newly created candidate
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'candidate_number' => [
                    'required', 
                    'string',
                    Rule::unique('candidates')->where(function ($query) use ($request) {
                        return $query->where('gender', $request->gender);
                    })
                ],
                'name' => 'required|string|max:255|min:2',
                'gender' => 'required|in:male,female',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:20480',
                'is_active' => 'boolean'
            ]);

            $data = [
                'candidate_number' => $validated['candidate_number'],
                'name' => trim($validated['name']),
                'gender' => $validated['gender'],
                'is_active' => $validated['is_active'] ?? true
            ];

            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                
                // Generate unique filename
                $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('candidates', $filename, 'public');
                $data['image_url'] = Storage::url($imagePath);
            }

            $candidate = Candidate::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Candidate created successfully',
                'data' => $candidate
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create candidate. Please try again.'
            ], 500);
        }
    }

    /**
     * Display the specified candidate
     */
    public function show(Candidate $candidate): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $candidate->id,
                'candidate_number' => $candidate->candidate_number,
                'name' => $candidate->name,
                'gender' => $candidate->gender,
                'image_url' => asset($candidate->image_url),
                'is_active' => $candidate->is_active,
                'scores' => $candidate->getScoresBreakdown(),
                'created_at' => $candidate->created_at,
                'updated_at' => $candidate->updated_at,
            ]
        ]);
    }

    /**
     * Update the specified candidate
     */
    public function update(Request $request, Candidate $candidate): JsonResponse
    {
        $request->validate([
            'candidate_number' => [
                'required', 
                'string', 
                Rule::unique('candidates')->where(function ($query) use ($request) {
                    return $query->where('gender', $request->gender);
                })->ignore($candidate->id)
            ],
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:20480',
            'is_active' => 'boolean'
        ]);

        $data = $request->only(['candidate_number', 'name', 'gender', 'is_active']);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($candidate->image_url) {
                $oldImagePath = str_replace('/storage/', '', $candidate->image_url);
                Storage::disk('public')->delete($oldImagePath);
            }

            $imagePath = $request->file('image')->store('candidates', 'public');
            $data['image_url'] = Storage::url($imagePath);
        }

        $candidate->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Candidate updated successfully',
            'data' => $candidate
        ]);
    }

    /**
     * Remove the specified candidate
     */
    public function destroy(Candidate $candidate): JsonResponse
    {
        // Delete image if exists
        if ($candidate->image_url) {
            $imagePath = str_replace('/storage/', '', $candidate->image_url);
            Storage::disk('public')->delete($imagePath);
        }

        $candidate->delete();

        return response()->json([
            'success' => true,
            'message' => 'Candidate deleted successfully'
        ]);
    }

    /**
     * Get candidates for judge voting
     */
    public function forJudging(Request $request): JsonResponse
    {
        $judge = $request->user();
        $category = $request->get('category', 'sports_attire');

        // Get all active candidates
        $candidates = Candidate::where('is_active', true)
            ->orderBy('candidate_number')
            ->get();

        // Add voting status for each candidate
        $candidatesForJudging = $candidates->map(function ($candidate) use ($judge, $category) {
            $hasVoted = $candidate->scores()
                ->where('judge_id', $judge->id)
                ->where('category', $category)
                ->exists();

            return [
                'id' => $candidate->id,
                'candidate_number' => $candidate->candidate_number,
                'name' => $candidate->name,
                'gender' => $candidate->gender,
                'image_url' => $candidate->image_url ? asset($candidate->image_url) : null,
                'has_voted' => $hasVoted,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'candidates' => $candidatesForJudging,
                'category' => $category,
                'progress' => $judge->getJudgingProgress($category)
            ]
        ]);
    }
}

