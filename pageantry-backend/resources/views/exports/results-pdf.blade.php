<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
    body {
        font-family: Arial, sans-serif;
        margin: 15px;
        color: #333;
        font-size: 11px;
    }
    .header {
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #007bff;
        padding-bottom: 15px;
    }

    .header h1 {
        color: #007bff;
        margin: 0;
        font-size: 17px; 
    }

    .header .school-name {
        color: maroon;
        font-weight: bold;
        font-size: 25px; 
        margin: 5px 0;
    }

    .header .pageant-name {
        font-weight: bold;
        font-size: 22px; 
        margin: 3px 0 8px 0;
        background: linear-gradient(to right, black, maroon);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .header p {
        margin: 5px 0;
        color: black;
        font-size: 20px;
    }

    .logo-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 40px;
        width: 100%;
        margin-bottom: 10px;
    }
    .logo-container img {
        height: 70px;
        width: 70px;
        border-radius: 50%;
        object-fit: cover;
    }
    .info {
        margin-bottom: 15px;
        background: #f8f9fa;
        padding: 10px;
        border-radius: 5px;
        font-size: 11px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        font-size: 10px;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 6px;
        text-align: center;
    }
    th {
        background-color: #007bff;
        color: white;
        font-weight: bold;
        font-size: 10px;
    }
    tr:nth-child(even) {
        background-color: #f2f2f2;
    }
    tr:hover {
        background-color: #e8f4f8;
    }
    .rank {
        font-weight: bold;
        text-align: center;
    }
    .rank-1 { color: #ffd700; }
    .rank-2 { color: #c0c0c0; }
    .rank-3 { color: #cd7f32; }
    .score {
        text-align: center;
        font-weight: bold;
    }
    .footer {
        margin-top: 20px;
        text-align: center;
        font-size: 10px;
        color: #666;
        border-top: 1px solid #ddd;
        padding-top: 10px;
    }
</style>

</head>
<body>
<div class="header">
    <div class="logo-container">
        <img src="{{ public_path('images/vclogo.jpg') }}" alt="VC Logo">
        <img src="{{ public_path('images/panagbangi_logo.jpg') }}" alt="Panagbangi Logo">
    </div>
    <div class="school-name">Vineyard International Polytechnic College</div>
    <div class="pageant-name">Mr. and Ms. Panagbangi 2025</div>
    <h1>Pageantry Tabulation System</h1>
    <p>{{ $title }}</p>
</div>

<div class="info">
    <p><strong>Filter:</strong> {{ ucfirst(str_replace('_', ' ', $filter)) }}</p>
    <p><strong>Generated:</strong> {{ $generated_at }}</p>
    <p><strong>Total Candidates:</strong> {{ count($results) }}</p>
</div>

<table>
    <thead>
        <tr>
            <th>Rank</th>
            <th>Candidate #</th>
            <th>Name</th>
            @if($filter === 'overall')
                <th>Production</th>
                <th>Headdress</th>
                <th>Sports Attire</th>
                <th>Casual Attire</th>
                <th>Opening Speech</th>
                <th>Swimsuit</th>
                <th>Gown</th>
                <th>Total Score</th>
            @else
                <th>Score</th>
            @endif
        </tr>
    </thead>
    <tbody>
        @foreach($results as $index => $result)
            <tr>
                <td class="rank rank-{{ $index + 1 <= 3 ? $index + 1 : 'other' }}">
                    #{{ $index + 1 }}
                </td>
                <td class="rank">{{ $result['candidate']->candidate_number }}</td>
                <td>{{ $result['candidate']->name }}</td>
                @if($filter === 'overall')
                    <td class="score">{{ number_format($result['production'], 2) }}</td>
                    <td class="score">{{ number_format($result['headress'], 2) }}</td>
                    <td class="score">{{ number_format($result['sports_attire'], 2) }}</td>
                    <td class="score">{{ number_format($result['casual_attire'], 2) }}</td>
                    <td class="score">{{ number_format($result['opening_speech'], 2) }}</td>
                    <td class="score">{{ number_format($result['swimsuit'], 2) }}</td>
                    <td class="score">{{ number_format($result['gown'], 2) }}</td>
                    <td class="score">{{ number_format($result['overall_total'], 2) }}</td>
                @else
                    <td class="score">{{ number_format($result['score'], 2) }}</td>
                @endif
            </tr>
        @endforeach
    </tbody>
</table>

<div class="footer">
    <p>Pageantry Tabulation System - Generated on {{ $generated_at }}</p>
    <p>This document contains confidential competition results.</p>
</div>
</body>
</html>
