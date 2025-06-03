<?php
include '../../conexion.php';
include '../../cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $response = ['success' => false, 'data' => [], 'total' => 0];
    
    if (!isset($_GET['tutor_id'])) {
        echo json_encode(['success' => false, 'message' => 'ID de tutor no proporcionado']);
        exit;
    }

    try {
        $tutorId = $_GET['tutor_id'];
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = 6;
        $offset = ($page - 1) * $limit;
        
        // Consulta para obtener el total de documentos del tutor
        $totalQuery = "
            SELECT COUNT(DISTINCT d.Id_Documento) as total 
            FROM Documento d
            INNER JOIN Documento_Tutor dt ON d.Id_Documento = dt.Documento_id
            WHERE dt.Usuario_id = ?";
        
        $stmtTotal = $conn->prepare($totalQuery);
        $stmtTotal->bind_param("i", $tutorId);
        $stmtTotal->execute();
        $totalResult = $stmtTotal->get_result();
        $total = $totalResult->fetch_assoc()['total'];
        
        // Consulta principal
        $query = "
            SELECT DISTINCT
                d.Id_Documento as id,
                d.Nombre_largo as nombreLargo,
                d.Nombre_corto as nombreCorto,
                d.Ruta_archivo as rutaArchivo,
                d.fecha,
                GROUP_CONCAT(DISTINCT u.Nombre) as tutores,
                GROUP_CONCAT(DISTINCT f.Nombre) as facultades,
                GROUP_CONCAT(DISTINCT univ.Nombre) as universidades,
                GROUP_CONCAT(DISTINCT c.Nombre) as categorias,
                GROUP_CONCAT(DISTINCT t.Palabra) as tags
            FROM Documento d
            INNER JOIN Documento_Tutor dt ON d.Id_Documento = dt.Documento_id
            LEFT JOIN Documento_Tutor dt2 ON d.Id_Documento = dt2.Documento_id
            LEFT JOIN Usuario u ON dt2.Usuario_id = u.Id_Usuario
            LEFT JOIN Documento_Facultad df ON d.Id_Documento = df.Documento_id
            LEFT JOIN Facultad f ON df.Facultad_id = f.Facultad_id
            LEFT JOIN Universidad univ ON f.Universidad_id = univ.Universidad_id
            LEFT JOIN Documento_Categoria dc ON d.Id_Documento = dc.Documento_id
            LEFT JOIN Categoria c ON dc.Categoria_id = c.Categoria_id
            LEFT JOIN Tag_Documento td ON d.Id_Documento = td.Documento_id
            LEFT JOIN Tag t ON td.Tag_id = t.Tag_id
            WHERE dt.Usuario_id = ?
            GROUP BY d.Id_Documento
            ORDER BY d.fecha DESC
            LIMIT ? OFFSET ?";
            
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iii", $tutorId, $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $documents = [];
        while($row = $result->fetch_assoc()) {
            $documents[] = [
                'id' => $row['id'],
                'nombreLargo' => $row['nombreLargo'],
                'nombreCorto' => $row['nombreCorto'],
                'rutaArchivo' => $row['rutaArchivo'],
                'fecha' => $row['fecha'],
                'tutores' => $row['tutores'] ? explode(',', $row['tutores']) : [],
                'facultades' => $row['facultades'] ? explode(',', $row['facultades']) : [],
                'universidades' => $row['universidades'] ? explode(',', $row['universidades']) : [],
                'categorias' => $row['categorias'] ? explode(',', $row['categorias']) : [],
                'tags' => $row['tags'] ? explode(',', $row['tags']) : []
            ];
        }
        
        $response = [
            'success' => true,
            'data' => $documents,
            'total' => $total,
            'totalPages' => ceil($total / $limit)
        ];
        
    } catch (Exception $e) {
        $response = ['success' => false, 'message' => $e->getMessage()];
    }
    
    echo json_encode($response);
}
?>