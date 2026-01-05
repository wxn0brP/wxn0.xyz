<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$logFile = __DIR__ . '/engagement.log';

$logLine = sprintf(
    "%s %s\n",
    date('Y-m-d H:i:s'),
    $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
);

$result = @file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);

if ($result === false) {
    http_response_code(500);
    error_log("Failed to write to log: $logFile");
    exit;
}

http_response_code(204);
