<?php
class ActivateCode extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }


    public function active($lab, $code)
    {
        $check = $this->check($code);
        if ($check) {
            $this->insert($code, $lab);
            $this->db->where('number', $code);
            $this->db->update(
                'activation_code',
                array(
                    'status' => 1,
                )
            );
            return $this->db->affected_rows();
        } else {
            return false;
        }
    }

    public function check($code)
    {
        // shoult by true
        $count_of_codes = $this->db->select('id')
            ->from('activation_code')
            ->where('number', $code)
            ->where('status', 0)
            ->get()
            ->result_array();
        // should be null
        $count_of_codes_used_by = $this->db->select('id')
            ->from('activation_code_used_by')
            ->where('code_number', $code)
            ->get()
            ->result_array();
        if ($count_of_codes && !$count_of_codes_used_by) {
            return true;
        } else {
            return false;
        }
    }

    public function insert($code, $lab)
    {
        $this->db->insert(
            'activation_code_used_by',
            array(
                'code_number' => $code,
                'lab_hash' => $lab,
            )
        );
        return $this->db->affected_rows();
    }

}