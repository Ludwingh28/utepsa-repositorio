<?php
include '../conexion.php';
include '../cors.php';
session_start();
session_destroy();
echo json_encode(["success" => true]);
?>