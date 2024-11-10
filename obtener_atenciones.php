<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'conexion.php';

try {
    $conexion = new Conexion();
    $pdo = $conexion->conectar();

    $query = "SELECT id, fecha_ingreso, paciente, medico, especialidad, actividad, diagnostico, fecha_alta FROM atenciones ORDER BY fecha_ingreso DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $atenciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $data = array();
    foreach($atenciones as $row) {
        $data[] = array(
            "id" => $row['id'],
            "fecha_ingreso" => $row['fecha_ingreso'],
            "paciente" => $row['paciente'],
            "medico" => $row['medico'],
            "especialidad" => $row['especialidad'],
            "actividad" => $row['actividad'],
            "diagnostico" => $row['diagnostico'],
            "fecha_alta" => $row['fecha_alta']
        );
    }
    
    $response = array("data" => $data);
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "error" => true,
        "message" => $e->getMessage()
    ));
}
?>