<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class JudgeController extends Controller
{
    /**
     * Display a listing of judges
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'judge');

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $judges = $query->orderBy('name')->get();

        // Add judging progress for each judge
        $judgesWithProgress = $judges->map(function ($judge) {
            return [
                'id' => $judge->id,
                'name' => $judge->name,
                'email' => $judge->email,
                'is_active' => $judge->is_active,
                'progress' => [
                    'sports_attire' => $judge->getJudgingProgress('sports_attire'),
                    'swimsuit' => $judge->getJudgingProgress('swimsuit'),
                    'talent' => $judge->getJudgingProgress('talent'),
                    'gown' => $judge->getJudgingProgress('gown'),
                    'qa' => $judge->getJudgingProgress('qa'),
                ],
                'created_at' => $judge->created_at,
                'updated_at' => $judge->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $judgesWithProgress
        ]);
    }

    /**
     * Store a newly created judge
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'is_active' => 'boolean'
        ]);

        $judge = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'judge',
            'is_active' => $request->get('is_active', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Judge created successfully',
            'data' => [
                'id' => $judge->id,
                'name' => $judge->name,
                'email' => $judge->email,
                'is_active' => $judge->is_active,
                'created_at' => $judge->created_at,
            ]
        ], 201);
    }

    /**
     * Display the specified judge
     */
    public function show(User $judge): JsonResponse
    {
        // Ensure the user is a judge
        if ($judge->role !== 'judge') {
            return response()->json([
                'success' => false,
                'message' => 'User is not a judge'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $judge->id,
                'name' => $judge->name,
                'email' => $judge->email,
                'is_active' => $judge->is_active,
                'progress' => [
                    'sports_attire' => $judge->getJudgingProgress('sports_attire'),
                    'swimsuit' => $judge->getJudgingProgress('swimsuit'),
                    'talent' => $judge->getJudgingProgress('talent'),
                    'gown' => $judge->getJudgingProgress('gown'),
                    'qa' => $judge->getJudgingProgress('qa'),
                ],
                'created_at' => $judge->created_at,
                'updated_at' => $judge->updated_at,
            ]
        ]);
    }

    /**
     * Update the specified judge
     */
    public function update(Request $request, User $judge): JsonResponse
    {
        // Ensure the user is a judge
        if ($judge->role !== 'judge') {
            return response()->json([
                'success' => false,
                'message' => 'User is not a judge'
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($judge->id)
            ],
            'password' => 'nullable|string|min:6',
            'is_active' => 'boolean'
        ]);

        $data = $request->only(['name', 'email', 'is_active']);

        // Update password if provided
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $judge->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Judge updated successfully',
            'data' => [
                'id' => $judge->id,
                'name' => $judge->name,
                'email' => $judge->email,
                'is_active' => $judge->is_active,
                'updated_at' => $judge->updated_at,
            ]
        ]);
    }

    /**
     * Remove the specified judge
     */
    public function destroy(User $judge): JsonResponse
    {
        // Ensure the user is a judge
        if ($judge->role !== 'judge') {
            return response()->json([
                'success' => false,
                'message' => 'User is not a judge'
            ], 404);
        }

        // Delete all scores by this judge
        $judge->scores()->delete();
        
        // Delete the judge
        $judge->delete();

        return response()->json([
            'success' => true,
            'message' => 'Judge deleted successfully'
        ]);
    }

    /**
     * Toggle judge active status
     */
    public function toggleStatus(User $judge): JsonResponse
    {
        // Ensure the user is a judge
        if ($judge->role !== 'judge') {
            return response()->json([
                'success' => false,
                'message' => 'User is not a judge'
            ], 404);
        }

        $judge->update([
            'is_active' => !$judge->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Judge status updated successfully',
            'data' => [
                'id' => $judge->id,
                'is_active' => $judge->is_active,
            ]
        ]);
    }
}

