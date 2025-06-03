<?php
include '../../conexion.php';
include '../../cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = ['success' => false, 'message' => ''];
    
    try {
        // Validar que el archivo sea PDF
        $file = $_FILES['archivo'];
        $allowedTypes = ['application/pdf'];
        $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($fileInfo, $file['tmp_name']);
        finfo_close($fileInfo);

        if (!in_array($mimeType, $allowedTypes)) {
            throw new Exception('Solo se permiten archivos PDF');
        }

        $conn->begin_transaction();
        
        // Manejar archivo
        $fileName = uniqid() . '_' . $file['name'];
        $uploadPath = '../archivos/' . $fileName;
        
        if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
            throw new Exception('Error al subir el archivo');
        }
        
        // Insertar documento
        $stmt = $conn->prepare("INSERT INTO Documento (Nombre_largo, Nombre_corto, Ruta_archivo, fecha) VALUES (?, ?, ?, ?)");
        $nombreLargo = $_POST['nombre'];
        $nombreCorto = $_POST['nombre_corto'];
        $ruta = 'archivos/' . $fileName;
        $fecha = date('Y-m-d');
        
        $stmt->bind_param("ssss", $nombreLargo, $nombreCorto, $ruta, $fecha);
        $stmt->execute();
        $documentoId = $conn->insert_id;
        
        // Insertar facultades
        $facultades = json_decode($_POST['facultades']);
        foreach ($facultades as $facultadId) {
            $stmt = $conn->prepare("INSERT INTO Documento_Facultad (Documento_id, Facultad_id) VALUES (?, ?)");
            $stmt->bind_param("ii", $documentoId, $facultadId);
            $stmt->execute();
        }
        
        // Insertar tutores
        $tutores = json_decode($_POST['tutores']);
        foreach ($tutores as $tutorId) {
            $stmt = $conn->prepare("INSERT INTO Documento_Tutor (Documento_id, Usuario_id) VALUES (?, ?)");
            $stmt->bind_param("ii", $documentoId, $tutorId);
            $stmt->execute();
        }
        
        // Insertar tags
        $tags = json_decode($_POST['tags']);
        foreach ($tags as $tagId) {
            $stmt = $conn->prepare("INSERT INTO Tag_Documento (Documento_id, Tag_id) VALUES (?, ?)");
            $stmt->bind_param("ii", $documentoId, $tagId);
            $stmt->execute();
        }
        
        // Insertar categorías
        $categorias = json_decode($_POST['categorias']);
        foreach ($categorias as $categoriaId) {
            $stmt = $conn->prepare("INSERT INTO Documento_Categoria (Documento_id, Categoria_id) VALUES (?, ?)");
            $stmt->bind_param("ii", $documentoId, $categoriaId);
            $stmt->execute();
        }
        
        $conn->commit();
        $response = ['success' => true, 'message' => 'Documento subido exitosamente'];
        
    } catch (Exception $e) {
        if (isset($uploadPath) && file_exists($uploadPath)) {
            unlink($uploadPath); // Eliminar el archivo si se produjo un error
        }
        $conn->rollback();
        $response = ['success' => false, 'message' => $e->getMessage()];
    }
    
    echo json_encode($response);
}
?>