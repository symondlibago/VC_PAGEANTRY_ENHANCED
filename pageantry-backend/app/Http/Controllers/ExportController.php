<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    /**
     * Export results as Excel
     */
    public function exportExcel(Request $request)
    {
        try {
            $filter = $request->get("filter", "overall");
            $gender = $request->get("gender", "all");

            // Basic allow-list validation
            $allowed = [
                "overall",
                "top_gown",
                "top_swimsuit",
                "top_talent",
                "top_qa",
                "top_sports_attire",
                "combined_categories"
            ];
            if (!in_array($filter, $allowed, true)) {
                $filter = "overall";
            }

            return Excel::download(new ResultsExport($filter, $gender), "pageant-results.xlsx");
        } catch (\Throwable $e) {
            Log::error("Excel export failed", ["error" => $e->getMessage(), "trace" => $e->getTraceAsString()]);
            return response()->json([
                "message" => "Failed to generate Excel export",
                "error" => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export results as PDF
     */
    public function exportPdf(Request $request)
    {
        try {
            $filter = $request->get("filter", "overall");
            $gender = $request->get("gender", "all");

            // Basic allow-list validation
            $allowed = [
                "overall",
                "top_gown",
                "top_swimsuit",
                "top_talent",
                "top_qa",
                "top_sports_attire",
                "combined_categories"
            ];
            if (!in_array($filter, $allowed, true)) {
                $filter = "overall";
            }

            $data = $this->getResultsData($filter, $gender);

            $pdf = Pdf::loadView("exports.results-pdf", $data);
            return $pdf->download("pageant-results.pdf");
        } catch (\Throwable $e) {
            Log::error("PDF export failed", ["error" => $e->getMessage(), "trace" => $e->getTraceAsString()]);
            return response()->json([
                "message" => "Failed to generate PDF export",
                "error" => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get results data based on filter and gender
     */
    private function getResultsData(string $filter, string $gender = "all"): array
    {
        $candidatesQuery = Candidate::where("is_active", true);

        if ($gender !== "all") {
            $candidatesQuery->where("gender", $gender);
        }

        $candidates = $candidatesQuery->get();

        switch ($filter) {
            case "top_gown":
                $results = $candidates->map(function ($candidate) {
                    return [
                        "candidate" => $candidate,
                        "score" => (float) $candidate->getAverageScore("gown"),
                    ];
                })->sortByDesc("score")->values();
                $title = "Top Gown Results";
                break;

            case "top_swimsuit":
                $results = $candidates->map(function ($candidate) {
                    return [
                        "candidate" => $candidate,
                        "score" => (float) $candidate->getAverageScore("swimsuit"),
                    ];
                })->sortByDesc("score")->values();
                $title = "Top Swimsuit Results";
                break;

            case "top_talent":
                $results = $candidates->map(function ($candidate) {
                    return [
                        "candidate" => $candidate,
                        "score" => (float) $candidate->getAverageScore("talent"),
                    ];
                })->sortByDesc("score")->values();
                $title = "Top Talent Results";
                break;

            case "top_qa":
                $results = $candidates->map(function ($candidate) {
                    return [
                        "candidate" => $candidate,
                        "score" => (float) $candidate->getAverageScore("qa"),
                    ];
                })->sortByDesc("score")->values();
                $title = "Top Q&A Results";
                break;

            case "top_sports_attire":
                $results = $candidates->map(function ($candidate) {
                    return [
                        "candidate" => $candidate,
                        "score" => (float) $candidate->getAverageScore("sports_attire"),
                    ];
                })->sortByDesc("score")->values();
                $title = "Top Sports Attire Results";
                break;

            case "overall":
            default:
                $results = $candidates->map(function ($candidate) {
                    $breakdown = $candidate->getScoresBreakdown();
                    return [
                        "candidate" => $candidate,
                        "sports_attire" => (float) $breakdown["sports_attire"],
                        "swimsuit" => (float) $breakdown["swimsuit"],
                        "talent" => (float) $breakdown["talent"],
                        "gown" => (float) $breakdown["gown"],
                        "qa" => (float) $breakdown["qa"],
                        "overall_total" => (float) $breakdown["overall_total"],
                    ];
                })->sortByDesc("overall_total")->values();
                $title = "Overall Results";
                break;

            case "combined_categories":
                $results = $candidates->map(function ($candidate) {
                    $breakdown = $candidate->getScoresBreakdown();
                    return [
                        "candidate" => $candidate,
                        "sports_attire" => (float) ($breakdown["sports_attire"] ?? 0),
                        "swimsuit" => (float) ($breakdown["swimsuit"] ?? 0),
                        "talent" => (float) ($breakdown["talent"] ?? 0),
                        "gown" => (float) ($breakdown["gown"] ?? 0),
                        "combined_total" => (float) (
                            ($breakdown["sports_attire"] ?? 0) +
                            ($breakdown["swimsuit"] ?? 0) +
                            ($breakdown["talent"] ?? 0) +
                            ($breakdown["gown"] ?? 0)
                        ),
                    ];
                })->sortByDesc("combined_total")->values();
                $title = "Combined Categories Results";
                break;
        }

        // For overall filter, ensure all score categories are present for each candidate
        if ($filter === 'overall') {
            $results = $results->map(function ($item) {
                $candidate = $item['candidate'];
                $breakdown = $candidate->getScoresBreakdown();
                return [
                    'candidate' => $candidate,
                    'sports_attire' => (float) ($breakdown['sports_attire'] ?? 0),
                    'swimsuit' => (float) ($breakdown['swimsuit'] ?? 0),
                    'talent' => (float) ($breakdown['talent'] ?? 0),
                    'gown' => (float) ($breakdown['gown'] ?? 0),
                    'qa' => (float) ($breakdown['qa'] ?? 0),
                    'overall_total' => (float) ($breakdown['overall_total'] ?? 0),
                ];
            });
        }

        if ($gender !== "all") {
            $title .= " (" . ucfirst($gender) . " Only)";
        }

        return [
            "title" => $title,
            "filter" => $filter,
            "gender" => $gender,
            "results" => $results,
            "generated_at" => now()->format("Y-m-d H:i:s"),
        ];
    }
}

// Excel Export Class
class ResultsExport implements \Maatwebsite\Excel\Concerns\FromCollection,
                              \Maatwebsite\Excel\Concerns\WithHeadings,
                              \Maatwebsite\Excel\Concerns\WithStyles,
                              \Maatwebsite\Excel\Concerns\WithTitle
{
    private string $filter;
    private string $gender;

    public function __construct(string $filter, string $gender = "all")
    {
        $this->filter = $filter;
        $this->gender = $gender;
    }

    public function collection()
    {
        $candidatesQuery = Candidate::where("is_active", true);
        if ($this->gender !== "all") {
            $candidatesQuery->where("gender", $this->gender);
        }
        $candidates = $candidatesQuery->get();

        switch ($this->filter) {
            case "top_gown":
                $rows = $candidates->map(function ($candidate) {
                    return [
                        "candidate_number" => $candidate->candidate_number,
                        "name" => $candidate->name,
                        "gender" => ucfirst($candidate->gender),
                        "score" => (float) $candidate->getAverageScore("gown"),
                    ];
                })->sortByDesc("score")->values();
                break;

            case "top_swimsuit":
                $rows = $candidates->map(function ($candidate) {
                    return [
                        "candidate_number" => $candidate->candidate_number,
                        "name" => $candidate->name,
                        "gender" => ucfirst($candidate->gender),
                        "score" => (float) $candidate->getAverageScore("swimsuit"),
                    ];
                })->sortByDesc("score")->values();
                break;

            case "top_talent":
                $rows = $candidates->map(function ($candidate) {
                    return [
                        "candidate_number" => $candidate->candidate_number,
                        "name" => $candidate->name,
                        "gender" => ucfirst($candidate->gender),
                        "score" => (float) $candidate->getAverageScore("talent"),
                    ];
                })->sortByDesc("score")->values();
                break;

            case "top_qa":
                $rows = $candidates->map(function ($candidate) {
                    return [
                        "candidate_number" => $candidate->candidate_number,
                        "name" => $candidate->name,
                        "gender" => ucfirst($candidate->gender),
                        "score" => (float) $candidate->getAverageScore("qa"),
                    ];
                })->sortByDesc("score")->values();
                break;

            case "top_sports_attire":
                $rows = $candidates->map(function ($candidate) {
                    return [
                        "candidate_number" => $candidate->candidate_number,
                        "name" => $candidate->name,
                        "gender" => ucfirst($candidate->gender),
                        "score" => (float) $candidate->getAverageScore("sports_attire"),
                    ];
                })->sortByDesc("score")->values();
                break;

            case "overall":
            default:
                $rows = $candidates->map(function ($candidate) {
                    $b = $candidate->getScoresBreakdown();
                    return [
                        "candidate_number" => $candidate->candidate_number,
                        "name" => $candidate->name,
                        "gender" => ucfirst($candidate->gender),
                        "sports_attire" => (float) $b["sports_attire"],
                        "swimsuit" => (float) $b["swimsuit"],
                        "talent" => (float) $b["talent"],
                        "gown" => (float) $b["gown"],
                        "qa" => (float) $b["qa"],
                        "overall_total" => (float) $b["overall_total"],
                    ];
                })->sortByDesc("overall_total")->values();
                break;

            case "combined_categories":
                $rows = $candidates->map(function ($candidate) {
                    $b = $candidate->getScoresBreakdown();
                    return [
                        "candidate_number" => $candidate->candidate_number,
                        "name" => $candidate->name,
                        "gender" => ucfirst($candidate->gender),
                        "sports_attire" => (float) ($b["sports_attire"] ?? 0),
                        "swimsuit" => (float) ($b["swimsuit"] ?? 0),
                        "talent" => (float) ($b["talent"] ?? 0),
                        "gown" => (float) ($b["gown"] ?? 0),
                        "combined_total" => (float) (
                            ($b["sports_attire"] ?? 0) +
                            ($b["swimsuit"] ?? 0) +
                            ($b["talent"] ?? 0) +
                            ($b["gown"] ?? 0)
                        ),
                    ];
                })->sortByDesc("combined_total")->values();
                break;
        }

        // Add rank and apply formatting at the end
        $withRank = $rows->values()->map(function ($row, $index) {
            $ranked = [
                "rank" => $index + 1,
                "candidate_number" => $row["candidate_number"],
                "name" => $row["name"],
                "gender" => $row["gender"],
            ];

            if ($this->filter === "overall") {
                $ranked["sports_attire"] = number_format($row["sports_attire"], 2);
                $ranked["swimsuit"] = number_format($row["swimsuit"], 2);
                $ranked["talent"] = number_format($row["talent"], 2);
                $ranked["gown"] = number_format($row["gown"], 2);
                $ranked["qa"] = number_format($row["qa"], 2);
                $ranked["overall_total"] = number_format($row["overall_total"], 2);
            } elseif ($this->filter === "combined_categories") {
                $ranked["sports_attire"] = number_format($row["sports_attire"], 2);
                $ranked["swimsuit"] = number_format($row["swimsuit"], 2);
                $ranked["talent"] = number_format($row["talent"], 2);
                $ranked["gown"] = number_format($row["gown"], 2);
                $ranked["combined_total"] = number_format($row["combined_total"], 2);
            } else {
                $ranked_label = match ($this->filter) {
                    "top_gown" => "gown_score",
                    "top_swimsuit" => "swimsuit_score",
                    "top_talent" => "talent_score",
                    "top_qa" => "qa_score",
                    "top_sports_attire" => "sports_attire_score",
                    default => "score",
                };
                $ranked[$ranked_label] = number_format($row["score"], 2);
            }

            return $ranked;
        });

        return $withRank;
    }

    public function headings(): array
    {
        switch ($this->filter) {
            case "top_gown":
                return ["Rank", "Candidate #", "Name", "Gender", "Gown Score"];
            case "top_swimsuit":
                return ["Rank", "Candidate #", "Name", "Gender", "Swimsuit Score"];
            case "top_talent":
                return ["Rank", "Candidate #", "Name", "Gender", "Talent Score"];
            case "top_qa":
                return ["Rank", "Candidate #", "Name", "Gender", "Q&A Score"];
            case "top_sports_attire":
                return ["Rank", "Candidate #", "Name", "Gender", "Sports Attire Score"];
            case "combined_categories":
                return ["Rank", "Candidate #", "Name", "Gender", "Sports Attire", "Swimsuit", "Talent", "Gown", "Combined Total"];
            case "overall":
            default:
                return ["Rank", "Candidate #", "Name", "Gender", "Sports Attire (20%)", "Swimsuit (20%)", "Talent (10%)", "Gown (20%)", "Q&A (30%)", "Total"];
        }
    }

    public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet)
    {
        return [
            1 => ["font" => ["bold" => true]],
        ];
    }

    public function title(): string
    {
        $title = "Pageant Results";
        if ($this->gender !== "all") {
            $title .= " (" . ucfirst($this->gender) . ")";
        }
        return $title;
    }
}



