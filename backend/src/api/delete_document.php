<?php
include '../../conexion.php';
include '../../cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_GET['id'])) {
        echo json_encode(['success' => false, 'message' => 'ID de documento no proporcionado']);
        exit;
    }

    try {
        $documentId = $_GET['id'];
        
        // Primero obtenemos la ruta del archivo para eliminarlo
        $stmt = $conn->prepare("SELECT Ruta_archivo FROM Documento WHERE Id_Documento = ?");
        $stmt->bind_param("i", $documentId);
        $stmt->execute();
        $result = $stmt->get_result();
        $document = $result->fetch_assoc();
        
        if ($document) {
            // Eliminamos el archivo físico
            $filePath = '../' . $document['Ruta_archivo'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            
            // Las relaciones se eliminarán automáticamente por las restricciones ON DELETE CASCADE
            
            // Eliminamos el documento de la base de datos
            $stmt = $conn->prepare("DELETE FROM Documento WHERE Id_Documento = ?");
            $stmt->bind_param("i", $documentId);
            $stmt->execute();
            
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Documento no encontrado']);
        }
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>