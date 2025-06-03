<?php
include '../../conexion.php';
include '../../cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $response = ['success' => false, 'data' => [], 'total' => 0];
    
    try {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = 6;
        $offset = ($page - 1) * $limit;
        
        $whereConditions = [];
        $params = [];
        $types = "";

         // Filtro por búsqueda general (nombre largo o corto)
         if (isset($_GET['search']) && $_GET['search']) {
            $whereConditions[] = "(d.Nombre_largo LIKE ? OR d.Nombre_corto LIKE ?)";
            $searchTerm = "%" . $_GET['search'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $types .= "ss";
        }
        
      // Filtro por tutores
      if (isset($_GET['tutores']) && $_GET['tutores']) {
        $tutores = json_decode($_GET['tutores']);
        if (!empty($tutores)) {
            $placeholders = str_repeat('?,', count($tutores) - 1) . '?';
            $whereConditions[] = "dt.Usuario_id IN ($placeholders)";
            foreach ($tutores as $tutorId) {
                $params[] = $tutorId;
                $types .= "i";
            }
        }
    }
    
    // Filtro por categorías
    if (isset($_GET['categorias']) && $_GET['categorias']) {
        $categorias = json_decode($_GET['categorias']);
        if (!empty($categorias)) {
            $placeholders = str_repeat('?,', count($categorias) - 1) . '?';
            $whereConditions[] = "dc.Categoria_id IN ($placeholders)";
            foreach ($categorias as $categoriaId) {
                $params[] = $categoriaId;
                $types .= "i";
            }
        }
    }

    // Filtro por tags
        if (isset($_GET['tags']) && $_GET['tags']) {
            $tags = json_decode($_GET['tags']);
            if (!empty($tags)) {
                // Modificamos la consulta para asegurar que el documento tenga TODOS los tags seleccionados
                $tagCount = count($tags);
                $placeholders = str_repeat('?,', count($tags) - 1) . '?';
                $whereConditions[] = "d.Id_Documento IN (
                    SELECT td.Documento_id 
                    FROM Tag_Documento td 
                    WHERE td.Tag_id IN ($placeholders)
                    GROUP BY td.Documento_id 
                    HAVING COUNT(DISTINCT td.Tag_id) = $tagCount
                )";
                foreach ($tags as $tagId) {
                    $params[] = $tagId;
                    $types .= "i";
                }
            }
        }
        
       // Filtro por fecha (específica o rango)
       if (isset($_GET['fecha']) && $_GET['fecha']) {
        $whereConditions[] = "DATE(d.fecha) = ?";
        $params[] = $_GET['fecha'];
        $types .= "s";
    } else if (isset($_GET['fechaInicio']) && isset($_GET['fechaFin'])) {
        $whereConditions[] = "DATE(d.fecha) BETWEEN ? AND ?";
        $params[] = $_GET['fechaInicio'];
        $params[] = $_GET['fechaFin'];
        $types .= "ss";
    }
        
        
       // Construir cláusula WHERE
       $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
        
        // Consulta para obtener el total de documentos
        $totalQuery = "
            SELECT COUNT(DISTINCT d.Id_Documento) as total 
            FROM Documento d
            LEFT JOIN Documento_Tutor dt ON d.Id_Documento = dt.Documento_id
            LEFT JOIN Documento_Categoria dc ON d.Id_Documento = dc.Documento_id
            $whereClause";
        
        $stmtTotal = $conn->prepare($totalQuery);
        if (!empty($params)) {
            $stmtTotal->bind_param($types, ...$params);
        }
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
            LEFT JOIN Documento_Tutor dt ON d.Id_Documento = dt.Documento_id
            LEFT JOIN Usuario u ON dt.Usuario_id = u.Id_Usuario
            LEFT JOIN Documento_Facultad df ON d.Id_Documento = df.Documento_id
            LEFT JOIN Facultad f ON df.Facultad_id = f.Facultad_id
            LEFT JOIN Universidad univ ON f.Universidad_id = univ.Universidad_id
            LEFT JOIN Documento_Categoria dc ON d.Id_Documento = dc.Documento_id
            LEFT JOIN Categoria c ON dc.Categoria_id = c.Categoria_id
            LEFT JOIN Tag_Documento td ON d.Id_Documento = td.Documento_id
            LEFT JOIN Tag t ON td.Tag_id = t.Tag_id
            $whereClause
            GROUP BY d.Id_Documento
            ORDER BY d.fecha DESC
            LIMIT ? OFFSET ?";
            
        $stmt = $conn->prepare($query);
        if (!empty($params)) {
            $params[] = $limit;
            $params[] = $offset;
            $types .= "ii";
            $stmt->bind_param($types, ...$params);
        } else {
            $stmt->bind_param("ii", $limit, $offset);
        }
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