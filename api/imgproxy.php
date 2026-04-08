<?php
// Proxy de imágenes para el admin — permite comprimir fotos de Firebase Storage
// Solo acepta URLs de firebasestorage.googleapis.com

$url = isset($_GET['url']) ? $_GET['url'] : '';
if (!$url || strpos($url, 'firebasestorage.googleapis.com') === false) {
  http_response_code(400); exit;
}

$content = @file_get_contents($url);
if ($content === false) { http_response_code(502); exit; }

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->buffer($content) ?: 'image/jpeg';

header('Content-Type: ' . $mime);
header('Access-Control-Allow-Origin: *');
header('Cache-Control: max-age=300');
echo $content;
