<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class VisitTest extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('Menu_db');
        $this->load->model('VisitTestModal');
        $this->load->library('ApiMiddelware');
        $token = $this->input->get_request_header('Authorization', TRUE);
        $token = str_replace("Bearer ", "", $token);
        $decoded_array = $this->jwt_dec($token);
        if ($decoded_array == 0) {
            echo json_encode(
                array(
                    "status" => false,
                    "message" => "Invalid token",
                    "isAuth" => false,
                    "data" => null
                ),
                JSON_UNESCAPED_UNICODE
            );
            exit();
        } else {
            $res = $this->Menu_db->check_user_by_hash($decoded_array["hash"], $decoded_array["lab_id"]);
            $token = $this->jwt_enc($res);
        }
    }

    public function createFromOtherDevice()
    {
        $visit_hash = $this->input->post('visit_hash');
        $test_hash = $this->input->post('test_hash');
        $result = $this->input->post('result');
        // check if visit_hash and test_hash is not empty
        if (empty($visit_hash) || empty($test_hash)) {
            echo json_encode(
                array(
                    "status" => false,
                    "message" => "visit_hash and test_hash is required",
                    "data" => null
                ),
                JSON_UNESCAPED_UNICODE
            );
            exit();
        }
        $res = $this->VisitTestModal->createFromOtherDevice($visit_hash, $test_hash, $result);
        echo json_encode(
            array(
                "status" => true,
                "message" => "success",
                "data" => $res
            ),
            JSON_UNESCAPED_UNICODE
        );
        exit();
    }


    public function index()
    {
        echo "hello world";
    }


    public function jwt_enc($data, $expir = "1900")
    {
        // die($expir);
        $iat = time();
        $exp = $iat + $expir;
        $data["iat"] = $iat;
        $data["exp"] = $exp;
        //die(print_r($data));
        $key = "@@redhaalasd2020@@";
        $payload = $data;
        $jwt = JWT::encode($payload, $key, 'HS256');
        return $jwt;
    }

    public function jwt_dec($token, $type = "normal")
    {
        //die("aaaa");
        try {
            $key = "@@redhaalasd2020@@";
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            $decoded_array = (array) $decoded;
            $exp = $decoded_array["exp"];
            $iat = time();
            //die($exp." x ".$iat." ".$type);
            if ($exp > $iat || $type == "logout")
                return $decoded_array;
            else
                return 0;
        } catch (Exception $e) {
            return 0;
        }
    }
}
