<?php
class VisitTestModal extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
        $this->load->library('migration');
    }

    public function createFromOtherDevice($visit_hash, $test_hash, $result)
    {
        $name = $this->getTestName($test_hash);
        $name = $name[0]['name'];

        $test_result = array(
            "$name" => "$result",
        );
        $test_result = json_encode($test_result);
        $query = $this->db->query("UPDATE lab_visits_tests SET result_test = '$test_result' WHERE tests_id = '$test_hash' and visit_id = '$visit_hash'");
        return $query;
    }

    public function getTestName($test_hash)
    {
        $query = $this->db->query("SELECT test_name as name FROM lab_test WHERE hash = '$test_hash'");
        return $query->result_array();
    }


}