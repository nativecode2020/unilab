<?php
defined('BASEPATH') or exit('No direct script access allowed');


class Network extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
    }


    public function index()
    {
        $computerName = gethostname();
        $port = 8807;
        $url = "http://" . $computerName . ":" . $port;
        $ip = "http://" . $_SERVER['SERVER_ADDR'] . ":" . $port;
        echo json_encode(
            array(
                "computerName" => $computerName,
                "url" => $url,
                "ip" => $ip
            ),
            JSON_UNESCAPED_UNICODE
        );
    }
}