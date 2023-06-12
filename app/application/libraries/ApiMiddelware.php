
<?php
class ApiMiddelware
{
    public function __construct()
    {
        // $this->load->database(); // Load the database library

        // if ($this->db->conn_id) {
        //     echo "Database connection is successful!";
        // } else {
        //     echo "Failed to connect to the database.";
        // }
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description, Authorization');
        header('Content-Type: application/x-www-form-urlencoded');
        header('Content-Type: application/json');
    }
}
