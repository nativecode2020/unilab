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

        echo json_encode(
            array(
                "computerName" => $computerName,
                "url" => $url
            ),
            JSON_UNESCAPED_UNICODE
        );
    }
}
