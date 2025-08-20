<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\JudgeController;
use App\Http\Controllers\ScoreController;
use App\Http\Controllers\ExportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post("/login", [AuthController::class, "login"]);

// Protected routes
Route::middleware("auth:sanctum")->group(function () {
    // Explicitly define candidates/for-judging at the very top to ensure priority
    Route::get("candidates/for-judging", [CandidateController::class, "forJudging"]);

    // Authentication routes
    Route::post("/logout", [AuthController::class, "logout"]);
    Route::get("/user", [AuthController::class, "user"]);
    Route::post("/change-password", [AuthController::class, "changePassword"]);

    // Routes accessible by both admin and judge
    Route::get("scores/progress", [ScoreController::class, "progress"]);
    Route::get("candidates/active", function () {
        return app(CandidateController::class)->index(request()->merge(["active" => true]));
    });

    // Judge only routes
    Route::middleware("role:judge")->group(function () {
        // Voting functionality
        Route::post("scores", [ScoreController::class, "store"]);
        Route::get("scores/mine", [ScoreController::class, "judgeScores"]);
        Route::get("scores/next-candidate", [ScoreController::class, "nextCandidate"]);
    });

    // Admin only routes
    Route::middleware("role:admin")->group(function () {
        // Candidate management
        Route::post('/candidates/{candidate}', [CandidateController::class, 'update']);
        Route::apiResource("candidates", CandidateController::class);
        
        // Judge management
        Route::apiResource("judges", JudgeController::class);
        Route::post("judges/{judge}/toggle-status", [JudgeController::class, "toggleStatus"]);
        
        // Score management (admin view)
        Route::get("scores", [ScoreController::class, "index"]);
        Route::get("scores/analytics", [ScoreController::class, "analytics"]);
        Route::get("candidates/{candidate}/scores", [ScoreController::class, "candidateScores"]);
        
        // Export functionality
        Route::get("export/excel", [ExportController::class, "exportExcel"]);
        Route::get("export/pdf", [ExportController::class, "exportPdf"]);
    });
});


