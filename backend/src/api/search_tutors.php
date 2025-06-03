<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: *");

include '../../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$searchTerm = $_GET['term'] ?? '';

$query = "SELECT u.Id_Usuario as id, u.Nombre as nombre 
          FROM Usuario u 
          INNER JOIN Tutor t ON u.Id_Usuario = t.Usuario_id 
          WHERE u.Nombre LIKE ? 
          ORDER BY u.Nombre ASC";

$stmt = $conn->prepare($query);
$searchTerm = "%$searchTerm%";
$stmt->bind_param("s", $searchTerm);
$stmt->execute();
$result = $stmt->get_result();

$tutores = [];
while($row = $result->fetch_assoc()) {
    $tutores[] = $row;
}

echo json_encode($tutores);
?>