<?php
include '../../conexion.php';
include '../../cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $response = ['success' => false, 'message' => '', 'data' => null];
    
    try {
        $stmt = $conn->prepare("INSERT INTO Tag (Palabra) VALUES (?)");
        $stmt->bind_param("s", $data['nombre']);
        $stmt->execute();
        
        $newId = $conn->insert_id;
        $response = [
            'success' => true,
            'message' => 'Tag creado exitosamente',
            'data' => ['id' => $newId, 'nombre' => $data['nombre']]
        ];
    } catch (Exception $e) {
        $response['message'] = $e->getMessage();
    }
    
    echo json_encode($response);
}
?>