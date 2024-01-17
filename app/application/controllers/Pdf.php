<?php
if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class Pdf extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('Menu_db');
        $this->load->model('Visit_model');
        $this->load->helper('download');
    }

    public function save()
    {
        $pk = $this->input->get('pk');
        $lab = $this->input->get('lab');
        $parm = "$pk-$lab";
        $patient = $this->Visit_model->getPatientDetail($pk);
        $name = $patient['name'];
        $date = $patient['date'];
        $date = str_replace("-", "_", $date);
        // check if folter exist c:\patient
        if (!file_exists("c:\patient")) {
            mkdir("c:\patient", 0777, true);
        }
        //  create folder with pk
        if (!file_exists("c:\patient\\$name")) {
            mkdir("c:\patient\\$name", 0777, true);
        }
        // file name
        $file = "c:\patient\\$name\\$date.pdf";
        $command = 'C:\xampp\ch\chrome --headless --disable-gpu --print-to-pdf="' . $file . '" --print-to-pdf-no-header  --virtual-time-budget=10000 http://localhost:8807/lab/show_invoice.html?pk=' . $parm . '';
        $output = exec($command);
        return array(
            "file" => $file,
            "folder" => "c:\patient\\$name"
        );
    }

    public function dwonload()
    {
        $file = $this->save();
        $file = $file['file'];
    }

    public function path()
    {
        $folder = $this->save();
        $folder = $folder['folder'];
        shell_exec("explorer $folder");
    }
}