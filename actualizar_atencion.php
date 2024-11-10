<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'conexion.php';

try {
    // Crear una instancia de la conexión y obtener el objeto PDO
    $conexion = new Conexion();
    $pdo = $conexion->conectar(); // Esto devuelve el objeto PDO

    // Verificar que existe el ID
    if (!isset($_POST['id']) || empty($_POST['id'])) {
        throw new Exception('ID no proporcionado');
    }

    // Verificar campos requeridos
    $campos_requeridos = ['fechaIngreso', 'paciente', 'medico', 'especialidad', 'actividad', 'diagnostico'];
    foreach ($campos_requeridos as $campo) {
        if (!isset($_POST[$campo]) || empty($_POST[$campo])) {
            throw new Exception("El campo $campo es requerido");
        }
    }

    $query = "UPDATE atenciones SET 
        fecha_ingreso = ?,
        paciente = ?,
        medico = ?,
        especialidad = ?,
        actividad = ?,
        diagnostico = ?,
        fecha_alta = ?
        WHERE id = ?";

    // Usar $pdo en lugar de $conexion para preparar la consulta
    $stmt = $pdo->prepare($query);
    
    $params = [
        $_POST['fechaIngreso'],
        $_POST['paciente'],
        $_POST['medico'],
        $_POST['especialidad'],
        $_POST['actividad'],
        $_POST['diagnostico'],
        !empty($_POST['alta']) ? $_POST['alta'] : null,
        $_POST['id']
    ];

    $stmt->execute($params);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('No se realizaron cambios en la atención');
    }

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>