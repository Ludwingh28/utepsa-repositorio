<?php
include '../../conexion.php';
include '../../cors.php';

$searchTerm = $_GET['term'] ?? '';

$query = "SELECT Tag_id as id, Palabra as nombre FROM Tag WHERE Palabra LIKE ?";
$stmt = $conn->prepare($query);
$searchTerm = "%$searchTerm%";
$stmt->bind_param("s", $searchTerm);
$stmt->execute();
$result = $stmt->get_result();

$tags = [];
while($row = $result->fetch_assoc()) {
    $tags[] = $row;
}

echo json_encode($tags);
?>