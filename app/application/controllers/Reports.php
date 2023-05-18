<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Reports extends CI_Controller
{

    function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->library('session');
        $this->load->model('Menu_db');
        $this->load->library('pagination');


        // $this->name = $this->session->userdata('name');
        // $this->id = $this->session->userdata('id');
        // $this->idhash = $this->session->userdata('idhash');
        // if ($this->name == "") {
        //     redirect('Login/logout');
        // }
        header('Content-Type: application/json; charset=utf-8');
        $token = $this->input->get_request_header('Authorization', TRUE);
        $token = explode(" ", $token)[1];
        $this->decoded_array = deCodeToken($token);
    }


    public function index()
    {
        echo json_encode(
            array(
                'status' => true,
                'message' => 'مرحبا بك في عالم البيانات',
                'data' => array(),
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function todayIncomes()
    {
        // الواردات اليومية
        $labId = $this->decoded_array['lab_id'];
        $hash = $this->decoded_array['hash'];
        // post date or today
        $date = $this->input->get('date')
            ? date('Y-m-d', strtotime($this->input->get('date')))
            : date('Y-m-d');
        $startDate = $this->input->get('startDate') ? date('Y-m-d', strtotime($this->input->get('startDate'))) : false;
        $endDate = $this->input->get('endDate') ? date('Y-m-d', strtotime($this->input->get('endDate'))) : false;
        $queryDate = $startDate && $endDate ? " visit_date >= '$startDate' AND visit_date <= '$endDate' " : " visit_date = '$date'";
        // convert date to Y-m-d
        $date = date('Y-m-d', strtotime($date));
        $allVisits = $this->Menu_db->run_query("SELECT total_price,dicount, net_price,visit_date, name,(select name from lab_doctor where hash=doctor_hash) as doctor,hash FROM `lab_visits` WHERE `labId` = '$labId' AND $queryDate AND `isdeleted` = 0", $hash);
        $allVisits = $allVisits['query'];
        $netPrice = 0;
        $totalPrice = 0;
        $dicount = 0;

        foreach ($allVisits as $visit) {
            $netPrice = number_format(intval($netPrice) + intval($visit->net_price));
            $totalPrice = number_format(intval($totalPrice) + intval($visit->total_price));
            $dicount = number_format(intval($dicount) + intval($visit->dicount));
        }
        $data = array(
            'date' => $date,
            'cards' => array(
                'الورادات الكلية' => "$totalPrice IQD",
                'الورادات قبل التخفيضات' => "$netPrice IQD",
                'التخفيضات' => "$dicount IQD",
                'عدد الزيارات' => count($allVisits)

            ),
            'allVisits' => $allVisits
        );
        echo json_encode(
            array(
                'status' => true,
                'message' => 'الواردات اليومية',
                'data' => $data,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }
}

function deCodeJwt($token, $type = "normal")
{
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

// function to decode jwt
function deCodeToken($token)
{
    $decoded_array = deCodeJwt($token);
    if ($decoded_array == 0) {
        echo json_encode(
            array(
                'status' => true,
                'message' => 'انتهت صلاحية الدخول',
                'data' => array(),
                'isAuth' => false
            ),
            JSON_UNESCAPED_UNICODE
        );
        die();
    } else {
        return $decoded_array;
    }
}
