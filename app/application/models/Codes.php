<?php
class Codes extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }

    public function records($search, $status, $type, $customer, $date)
    {
        $this->db->select('count(*) as count');
        $this->db->from('activation_code');
        $this->db->like('number', $search);
        if ($status == 0 || $status == 1) {
            $this->db->where('status', $status);
        }
        if ($type != "") {
            $this->db->where('type', $type);
        }
        if ($customer != "") {
            $this->db->like('customer', $customer);
        }
        if ($date != "") {
            $this->db->where('date(date)', $date);
        }
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    public function createCodes($number, $type, $hash, $customer)
    {
        $codesNumber = $number;
        while ($number > 0) {
            $this->db->insert(
                'activation_code',
                array(
                    'type' => $type,
                    'generated_by' => $hash,
                    'customer' => $customer,
                )
            );
            $number--;
        }
        // get the last inserted codes limit by $codesNumber
        $this->db->select('number, type, status,date, (select name from system_users where hash=generated_by limit 1) as user');
        $this->db->from('activation_code');
        // limit
        $this->db->limit($codesNumber);
        $codes = $this->db->get();
        return $codes->result_array();
    }

    public function updateCode($number, $data)
    {
        $this->db->where('number', $number);
        $this->db->update('activation_code', $data);
        return $this->db->affected_rows();
    }

    public function deleteCode($number)
    {
        $this->db->where('number', $number);
        $this->db->delete('activation_code');
        return $this->db->affected_rows();
    }

    public function getCode($number)
    {
        $this->db->select('number, type, status,date, (select name from system_users where hash=generated_by limit 1) as user');
        $this->db->from('activation_code');
        $this->db->where('number', $number);
        $code = $this->db->get();
        return $code->result_array();
    }

    public function getCodes($start, $length, $search, $status, $type, $customer, $date)
    {
        $this->db->select('number, customer,(select name from activation_code_type where hash=activation_code.type) as type, status,date(date) as date, generated_by as user');
        $this->db->from('activation_code');
        $this->db->like('number', $search);
        if ($status == 0 || $status == 1) {
            $this->db->where('status', $status);
        }
        if ($type != "") {
            $this->db->where('type', $type);
        }
        if ($customer != "") {
            $this->db->like('customer', $customer);
        }
        if ($date != "") {
            $this->db->where('date(date)', $date);
        }
        $this->db->order_by('id', 'DESC');
        $this->db->limit($length, $start);
        $codes = $this->db->get();
        $codes = $codes->result_array();
        $length = $this->records($search, $status, $type, $customer, $date);
        return array(
            "length" => $length,
            "codes" => $codes,
        );
    }

    public function ActivatedCode($start, $length, $search, $type, $lab, $start_date, $end_date)
    {
        // table is activation_code_used_by (id, code_number, lab_hash, date)
        $this->db->select("activation_code_used_by.code_number, activation_code_used_by.lab_hash");
        // time 10:00 pm format
        $this->db->select("DATE_FORMAT(activation_code_used_by.date, '%h:%i %p') as time");
        // date format
        $this->db->select("DATE_FORMAT(activation_code_used_by.date, '%d/%m/%Y') as date");
        // lab name
        $this->db->select("lab.name as lab_name");

        // expire date
        $this->db->select("DATE_FORMAT(lab_expire.expire_date, '%d/%m/%Y') as expire_date");
        // code type
        $this->db->select("activation_code_type.name as code_type");
        $this->db->from("activation_code_used_by");
        // left join lab
        $this->db->join("lab_expire", "lab_expire.lab_id = activation_code_used_by.lab_hash", "left");

        $this->db->join("lab", "lab.id = activation_code_used_by.lab_hash", "left");
        // left join activation_code
        $this->db->join("activation_code", "activation_code.number = activation_code_used_by.code_number");
        // inner join activation_code_type
        $this->db->join("activation_code_type", "activation_code_type.hash = activation_code.type");
        // where 
        // check if type isset or null orr empty
        if (!empty($type) || $type != null || $type != "" || $type != 0 || $type != "0") {
            $this->db->like("activation_code.type", $type);
        }
        // check if lab isset or null orr empty
        if (!empty($lab) || $lab != null || $lab != "" || $lab != 0 || $lab != "0") {
            $this->db->like("activation_code_used_by.lab_hash", $lab);
        }
        // check if start_date isset or null orr empty
        if (!empty($start_date) || $start_date != null || $start_date != "") {
            $this->db->where("date(activation_code_used_by.date) >=", $start_date);
        }
        // check if end_date isset or null orr empty
        if (!empty($end_date) || $end_date != null || $end_date != "") {
            $this->db->where("date(activation_code_used_by.date) <=", $end_date);
        }
        // check if search isset or null orr empty
        if (!empty($search) || $search != null || $search != "") {
            $this->db->like("activation_code_used_by.code_number", $search);
            // or like lab name
            $this->db->or_like("lab.name", $search);
        }
        // order by
        $this->db->order_by("activation_code_used_by.id", "DESC");
        // limit
        $this->db->limit($length, $start);
        // get
        $codes = $this->db->get();
        $codes = $codes->result_array();
        // get length
        $length = $this->ActivatedCodeLength($search, $type, $lab, $start_date, $end_date);
        return array(
            "length" => $length,
            "codes" => $codes,
        );

    }

    public function ActivatedCodeLength($search, $type, $lab, $start_date, $end_date)
    {
        // table is activation_code_used_by (id, code_number, lab_hash, date)
        $this->db->select("activation_code_used_by.code_number, activation_code_used_by.lab_hash, activation_code_used_by.date");
        $this->db->from("activation_code_used_by");
        // left join lab
        $this->db->join("lab", "lab.id = activation_code_used_by.lab_hash", "left");
        // left lab_expire
        $this->db->join("lab_expire", "lab_expire.lab_id = activation_code_used_by.lab_hash", "left");
        // left join activation_code
        $this->db->join("activation_code", "activation_code.number = activation_code_used_by.code_number");
        // inner join activation_code_type
        $this->db->join("activation_code_type", "activation_code_type.hash = activation_code.type");
        // where 
        // check if type isset or null orr empty
        if (!empty($type) || $type != null || $type != "" || $type != 0 || $type != "0") {
            $this->db->like("activation_code.type", $type);
        }
        // check if lab isset or null orr empty
        if (!empty($lab) || $lab != null || $lab != "" || $lab != 0 || $lab != "0") {
            $this->db->like("activation_code_used_by.lab_hash", $lab);
        }
        // check if start_date isset or null orr empty
        if (!empty($start_date) || $start_date != null || $start_date != "") {
            $this->db->where("activation_code_used_by.date >=", $start_date);
        }
        // check if end_date isset or null orr empty
        if (!empty($end_date) || $end_date != null || $end_date != "") {
            $this->db->where("activation_code_used_by.date <=", $end_date);
        }
        // check if search isset or null orr empty
        if (!empty($search) || $search != null || $search != "") {
            $this->db->like("activation_code_used_by.code_number", $search);
        }
        // order by
        $this->db->order_by("activation_code_used_by.id", "DESC");
        // get
        $codes = $this->db->get();
        $codes = $codes->result_array();
        return count($codes);
    }
}