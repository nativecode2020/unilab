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
        $ip = $_SERVER['SERVER_ADDR'];
        $ipUrl = "http://" . $ip . ":" . $port;
        echo json_encode(
            array(
                "computerName" => $computerName,
                "url" => $url,
                "ip" => $ip,
                "ipUrl" => $ipUrl
            ),
            JSON_UNESCAPED_UNICODE
        );
    }
}