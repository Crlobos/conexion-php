<?php
// Habilitar todos los errores para depuración
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Incluir el archivo de conexión a la base de datos
include 'conexion.php';

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Crear una instancia de la conexión
        $conexion = new Conexion();
        $pdo = $conexion->conectar();

        // Obtener el ID de la atención a eliminar
        if (!isset($_POST['id']) || empty($_POST['id'])) {
            throw new Exception('ID no proporcionado');
        }
        $id = $_POST['id'];

        // Preparar la consulta SQL para eliminar la atención
        $query = "DELETE FROM atenciones WHERE id = :id";
        $stmt = $pdo->prepare($query);
        
        // Vincular el parámetro y ejecutar la consulta
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        // Verificar si se eliminó algún registro
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontró la atención para eliminar']);
        }
    } catch(PDOException $e) {
        // Enviar un mensaje de error si hay un problema con la base de datos
        echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
    } catch(Exception $e) {
        // Capturar cualquier otra excepción
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    // Si la solicitud no es POST, devolver un error
    echo json_encode(['success' => false, 'message' => 'Método de solicitud no válido']);
}
?>