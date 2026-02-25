<?php
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

if (!isset($_GET['i']) || !preg_match('/^\d+$/', $_GET['i'])) {
    http_response_code(400);
    echo "Invalid comic number";
    exit;
}

$comicNumber = $_GET['i'];

// xkcd #404 does not exist (intentional)
if ($comicNumber === '404') {
    http_response_code(404);
    echo "Comic not found";
    exit;
}

$url = "https://xkcd.com/{$comicNumber}/info.0.json";

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'timeout' => 5
    ]
]);

$response = @file_get_contents($url, false, $context);

if ($response === false) {
    http_response_code(502);
    echo "Failed to fetch comic data";
    exit;
}

$data = json_decode($response, true);

if (!isset($data['img'])) {
    http_response_code(500);
    echo "Invalid API response";
    exit;
}

echo $data['img'];
