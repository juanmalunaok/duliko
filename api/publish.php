<?php
// Publica el catálogo estático — escribe data/products.json en el servidor
// Llamado desde el panel admin con el secreto correcto
// Para deshabilitar: quitar js/catalog-static.js de index.html y admin.html

define('DULIKO_SECRET', 'dul1k0pub_2024');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"error":"Method not allowed"}'; exit; }

$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (!$data || !isset($data['secret']) || $data['secret'] !== DULIKO_SECRET) {
  http_response_code(403); echo '{"error":"Forbidden"}'; exit;
}

if (!isset($data['products']) || !is_array($data['products'])) {
  http_response_code(400); echo '{"error":"Invalid data"}'; exit;
}

$outputPath = dirname(__DIR__) . '/data/products.json';

if (!is_dir(dirname($outputPath))) {
  mkdir(dirname($outputPath), 0755, true);
}

$result = file_put_contents($outputPath, json_encode($data['products'], JSON_UNESCAPED_UNICODE));

if ($result === false) {
  http_response_code(500); echo '{"error":"No se pudo escribir el archivo. Verificar permisos."}'; exit;
}

echo json_encode(['ok' => true, 'count' => count($data['products'])]);
