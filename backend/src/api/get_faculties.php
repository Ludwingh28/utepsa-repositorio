<?php
include '../../conexion.php';
include '../../cors.php';

$query = "SELECT f.Facultad_id as id, CONCAT(f.Nombre, ' - ', u.Nombre) as nombre 
          FROM Facultad f 
          JOIN Universidad u ON f.Universidad_id = u.Universidad_id";
$result = $conn->query($query);

$facultades = [];
while($row = $result->fetch_assoc()) {
    $facultades[] = $row;
}

echo json_encode($facultades);
?>