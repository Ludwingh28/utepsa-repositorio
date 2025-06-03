<?php
include '../../conexion.php';
include '../../cors.php';

$query = "SELECT Categoria_id as id, Nombre as nombre FROM Categoria";
$result = $conn->query($query);

$categorias = [];
while($row = $result->fetch_assoc()) {
    $categorias[] = $row;
}

echo json_encode($categorias);
?>