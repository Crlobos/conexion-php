<?php
class Conexion {
    private $conn;

    public function conectar() {
        $host = "localhost";  
        $port = 5432;
        $dbname = "atenciones";
        $user = "postgres";
        $password = "root";

        try {
            $this->conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname;user=$user;password=$password");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $this->conn;
        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }
}
?>