<?php
class Tests_model extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }

    public function record_count($search)
    {
        $this->db->select('count(*) as count');
        $this->db->from('lab_test');
        $this->db->where('isdeleted', 0);
        $this->db->like('test_name', $search);
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    public function record_count_for_lab($search, $lab_id)
    {
        $devices = $this->getDevicesForLab($lab_id);
        $kits = $this->getKitsForLab($devices);
        $kits = implode(',', $kits);
        $query = $this->db->query("
        SELECT 
        lab_test.id
        FROM 
            lab_pakage_tests
        LEFT JOIN lab_test ON lab_test.hash = lab_pakage_tests.test_id
        WHERE 
            test_name LIKE '%$search%' AND
            lab_pakage_tests.isdeleted = 0 AND
            (
                lab_pakage_tests.lab_id = $lab_id 
            ) 
        GROUP BY
            lab_test.hash
        ");
        $result = $query->result_array();
        return count($result);
    }

    public function record_count_calc($search)
    {
        $this->db->select('count(*) as count');
        $this->db->from('lab_test');
        $this->db->where('isdeleted', 0);
        $this->db->where('test_type', 3);
        $this->db->like('test_name', $search);
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    function getTests($start, $length, $search)
    {
        // like
        $this->db->select(
            'test_name,category_hash,(select name from lab_test_catigory where hash=lab_test.category_hash) as category_name,hash,option_test'
        );
        // inner join 
        $this->db->from('lab_test');
        // and
        $this->db->where('isdeleted', 0);
        // like
        $this->db->like('test_name', $search);
        // order by
        $this->db->order_by('id', 'DESC');
        // limit
        $this->db->limit($start, $length);
        // get
        $query = $this->db->get();
        return $query->result_array();
    }

    function getTestsForLab($start, $length, $search, $lab_id)
    {
        $devices = $this->getDevicesForLab($lab_id);
        $kits = $this->getKitsForLab($devices);
        $kits = implode(',', $kits);
        $query = $this->db->query(
            "
            SELECT
                lab_test.hash,
                lab_test.test_name,
                category_hash,
                (SELECT name FROM lab_test_catigory WHERE hash = lab_test.category_hash) AS category_name,
                lab_test.option_test
            FROM 
                lab_pakage_tests
            LEFT JOIN lab_test ON lab_test.hash = lab_pakage_tests.test_id
            WHERE 
                test_name LIKE '%$search%' AND
                lab_pakage_tests.isdeleted = 0 AND
                (
                    lab_pakage_tests.lab_id = $lab_id 
                ) 
            GROUP BY
                lab_test.hash
            ORDER BY
                lab_test.id DESC
            LIMIT $length , $start
        "
        );
        return $query->result_array();
        // OR EXISTS (
        //     SELECT 1
        //     FROM JSON_TABLE(
        //         lab_test.option_test,
        //         '$.component[0].reference[*].kit' COLUMNS(
        //             kit varchar(255) PATH '$'
        //         )
        //     ) jt
        //     WHERE jt.kit IN ($kits)
        // ) 
        // or lab_test.test_type = 3
    }

    public function getDevicesForLab($lab_id)
    {
        $this->db->select('devices_id');
        $this->db->from('lab_device');
        $this->db->where('is_deleted', 0);
        $this->db->where('lab_id', $lab_id);
        $query = $this->db->get();
        // get array of devices
        $devices = $query->result_array();
        // map devices to array
        $devices = array_map(function ($device) {
            return $device['devices_id'];
        }, $devices);
        return $devices;
    }

    public function getKitsForLab($devices)
    {
        $this->db->select('kit_id');
        $this->db->from('device_kit');
        $this->db->where('is_deleted', 0);
        $this->db->where_in('device_id', $devices);
        $query = $this->db->get();
        // get array of devices
        $kits = $query->result_array();
        // map devices to array
        $kits = array_map(function ($kit) {
            return $kit['kit_id'];
        }, $kits);
        return $kits;
    }


    function getCalcTests($start, $length, $search)
    {
        $this->db->select('hash,test_name,category_hash,');
        $this->db->from('lab_test');
        $this->db->where('isdeleted', 0);
        $this->db->where('test_type', 3);
        // like
        $this->db->like('test_name', $search);
        // order by
        $this->db->order_by('id', 'DESC');
        // limit
        $this->db->limit($start, $length);
        // get
        $query = $this->db->get();
        return $query->result_array();
    }
}
