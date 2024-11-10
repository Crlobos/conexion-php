<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'conexion.php';

try {
    // Crear una instancia de la conexión
    $conexion = new Conexion();
    $pdo = $conexion->conectar();

    // Validar datos recibidos
    if (empty($_POST['paciente']) || empty($_POST['medico'])) {
        throw new Exception('Faltan campos requeridos');
    }

    // Preparar la consulta
    $query = "INSERT INTO atenciones (fecha_ingreso, paciente, medico, especialidad, actividad, diagnostico, fecha_alta) 
              VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($query);
    
    // Ejecutar la consulta
    $stmt->execute([
        $_POST['fechaIngreso'],
        $_POST['paciente'],
        $_POST['medico'],
        $_POST['especialidad'],
        $_POST['actividad'],
        $_POST['diagnostico'],
        !empty($_POST['alta']) ? $_POST['alta'] : null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Atención guardada correctamente'
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos: ' . $e->getMessage()
    ]);
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>