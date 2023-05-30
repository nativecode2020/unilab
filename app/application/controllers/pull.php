<?php

class pull extends CI_Controller
{

    function __construct()
    {
        parent::__construct();
        $this->load->model('User_model');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description, Authorization');
        // json response
        header('Content-Type: application/json');
    }


    public function pull()
    {
        // try to pull update
        //$output = shell_exec('cd /var/www/html/ && git pull https://nativecode2020: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@github.com/nativecode2020/lab.git 2>&1');

        $command = 'cd C:\xampp\htdocs && git reset --hard 2>&1 && git stash --include-untracked 2>&1 && git pull https://nativecode2020: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@github.com/nativecode2020/unilab.git 2>&1';
        $output = exec($command);

        // $output = shell_exec('cd /var/www/html/ &&  git reset --hard 2>&1 && git stash --include-untracked 2>&1 && git pull https://nativecode2020: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@github.com/nativecode2020/lab.git 2>&1');
        // check if update is success or not or need to merge 
        if (strpos($output, 'Already up to date.') !== false) {
            echo json_encode( // no update
                array(
                    'status' => 400,
                    'message' => 'لا يوجد تحديثات',
                    'data' => $output,
                    'isAuth' => false
                ),

                JSON_UNESCAPED_UNICODE
            );
            die();
            // pull is done by check updating work not /updating/ or changed files
        } else if ((strpos($output, 'Updating') !== false || (strpos($output, 'changed') !== false)) && strpos($output, 'fatal') == false) {
            echo json_encode(
                array(
                    'status' => 200,
                    'message' => 'تم تحديث البرنامج بنجاح ..',
                    'data' => $output,
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
            die();
        } else {
            // shell_exec('cd /var/www/html/ && git stash --include-untracked 2>&1 && git pull https://nativecode2020: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@github.com/nativecode2020/lab.git  2>&1');
            echo json_encode(
                array(
                    'status' => 200,
                    'message' => 'الرجاء التواصل مع الدعم الفني لتحديث البرنامج',
                    'data' => $output,
                    'isAuth' => true
                ),

                JSON_UNESCAPED_UNICODE
            );
        }
    }
}
