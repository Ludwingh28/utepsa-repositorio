<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->username) && isset($data->password)) {
        $username = $data->username;
        $password = $data->password;

        // Primero verificamos las credenciales en la tabla Usuario
        $stmt = $conn->prepare("SELECT Id_Usuario, Usuario, Nombre, Contrasena 
                               FROM Usuario 
                               WHERE Usuario = ? AND Contrasena = ?");
        $stmt->bind_param("ss", $username, $password);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $userId = $user['Id_Usuario'];
            
            // Verificamos los roles del usuario
            $roles = [];
            
            // Verificar si es estudiante
            $stmt = $conn->prepare("SELECT * FROM Estudiante WHERE Usuario_id = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            if ($stmt->get_result()->num_rows > 0) {
                $roles[] = "estudiante";
            }
            
            // Verificar si es tutor
            $stmt = $conn->prepare("SELECT * FROM Tutor WHERE Usuario_id = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            if ($stmt->get_result()->num_rows > 0) {
                $roles[] = "tutor";
            }
            
            // Verificar si es admin
            $stmt = $conn->prepare("SELECT * FROM Admin WHERE Usuario_id = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            if ($stmt->get_result()->num_rows > 0) {
                $roles[] = "admin";
            }

            session_start();
            $_SESSION['user'] = [
                'id' => $user['Id_Usuario'],
                'username' => $user['Usuario'],
                'name' => $user['Nombre'],
                'roles' => $roles
            ];

            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $user['Id_Usuario'],
                    "username" => $user['Usuario'],
                    "name" => $user['Nombre'],
                    "roles" => $roles
                ]
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Usuario o contraseña incorrectos"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Faltan credenciales"
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Método no permitido"]);
}
?>