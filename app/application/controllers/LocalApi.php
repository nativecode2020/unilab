<?php

class LocalApi extends CI_Controller
{

    function __construct()
    {
        parent::__construct();
        $this->load->model('User_model');
        $this->load->helper('download');
        $this->load->database(); // Load the database library
        if (!$this->db->conn_id) {
            echo json_encode(
                array(
                    'status' => false,
                    'message' => 'عدد المستخدمين',
                    'data' => null,
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
            exit();
        }
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description, Authorization');
        // json response
        header('Content-Type: application/json');
    }

    public function getUserCount()
    {
        $userCount = $this->User_model->get_user_count();
        if ($userCount == 0) {
            $this->trancateLabTable();
        }
        echo json_encode(
            array(
                'status' => true,
                'message' => 'عدد المستخدمين',
                'data' => $userCount,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
        die();
    }

    public function trancateLabTable()
    {
        // trancate lab table
        $this->db->query('TRUNCATE TABLE lab;');
    }

    // add user
    public function addUser()
    {
        $data = array(
            'id' => $this->input->post('id'),
            'lab_id' => $this->input->post('lab_id'),
            'name' => $this->input->post('name'),
            'username' => $this->input->post('username'),
            'password' => $this->input->post('password'),
            'user_type' => $this->input->post('user_type'),
            'hash' => $this->input->post('hash'),
            'insert_record_date' => $this->input->post('insert_record_date'),
            'is_deleted' => $this->input->post('is_deleted'),
            'isIos' => $this->input->post('isIos'),
            'device_info' => $this->input->post('device_info'),
            'token' => $this->input->post('token'),
            'type2' => $this->input->post('type2'),
        );
        $insert = $this->User_model->add_user($data);
        $this->db->insert(
            'system_put_role_to_users',
            array(
                'group_hash' => $this->input->post('user_type'),
                'user_hash' => $this->input->post('hash'),
                'hash' => $this->input->post('hash')
            )
        );
        $this->db->update(
            'system_users_type',
            array(
                // now
                'insert_record_date' => date('Y-m-d H:i:s'),
            ),
            array('id' => 1)
        );
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تمت إضافة المستخدم بنجاح',
                'data' => $data,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
        die();
    }

    public function run_queries()
    {
        $queries = $this->input->post("queries");
        $queries = json_decode($queries);
        // run all queries
        set_time_limit(500);
        foreach ($queries as $query) {
            if (isset($query)) {
                $this->db->query($query);
            }
        }
        // trancate offline_sync table
        $this->db->query('TRUNCATE TABLE offline_sync');
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تمت إضافة المستخدم بنجاح',
                'data' => $queries,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
        die();
    }

    public function getTestsQueries()
    {
        $queries = "";
        $lab_hash = $this->input->post('lab_id');
        $tests = $this->db->query("select test_name, test_type, option_test, hash, insert_record_date, isdeleted, short_name, sample_type, category_hash, sort from lab_test")->result();

        if (count($tests) > 0) {
            $tests_query = "insert into lab_test(" . implode(",", array_keys((array) $tests[0])) . ", lab_hash) values ";
            $tests_values = array_map(function ($test) use ($lab_hash) {
                $option_test = $test->option_test;
                $option_test = str_replace('"', '\"', $option_test);
                $test->option_test = $option_test;
                $name = $test->test_name;
                $name = str_replace("'", "", $name);
                $test->test_name = $name;
                return "('" . implode("','", array_values((array) $test)) . "', '$lab_hash')";
            }, $tests);
            $tests_query .= implode(",", $tests_values);
            $queries .= $tests_query;
        } else {
            $tests_query = '';
        }

        if ($queries != '') {
            $token = $this->input->get_request_header('Authorization', TRUE);
            $token = str_replace("Bearer ", "", $token);

            $url = "http://umc.native-code-iq.com/app/index.php/Offline/insertIntoLab_test";
            $headers = [
                "Authorization: Bearer {$token}",
            ];

            // add lab_id to post data
            $data = array(
                'lab_id' => $lab_hash,
                'query' => $queries
            );

            $ch = curl_init($url);

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));

            $response = curl_exec($ch);

            if (curl_errno($ch)) {
                echo 'Error: ' . curl_error($ch);
            }

            curl_close($ch);
            echo json_encode(
                array(
                    'status' => true,
                    'message' => 'تمت إضافة الاختبارات بنجاح',
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
        } else {
            echo json_encode(
                array(
                    'status' => true,
                    'message' => 'لا يوجد بيانات',
                    'data' => null,
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );

        }

    }

    public function installTests()
    {
        $queries = "";
        $lab_hash = $this->input->post('lab_id');
        $token = $this->input->get_request_header('Authorization', TRUE);
        $token = str_replace("Bearer ", "", $token);

        $url = "http://umc.native-code-iq.com/app/index.php/Offline/installTests";
        $headers = [
            "Authorization: Bearer {$token}",
        ];
        $data = array(
            'lab_id' => $lab_hash,
        );

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            echo 'Error: ' . curl_error($ch);
        }

        curl_close($ch);
        if ($response == "") {
            echo json_encode(
                array(
                    'status' => false,
                    'message' => 'لا توجد نسخة احتياطية',
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
            exit();
        } else {
            $this->db->trans_start();
            $this->db->query("SET SQL_SAFE_UPDATES = 0");
            $this->db->query("truncate table lab_test");
            $this->db->query($response);
            $this->db->query("SET SQL_SAFE_UPDATES = 1");

            // end transaction
            if ($this->db->trans_status() === FALSE) {
                // حدثت مشكلة خلال الـtransaction
                $result = false;
                $this->db->trans_rollback();
            } else {
                // تمت العمليات بنجاح
                $result = true;
                $this->db->trans_commit();
            }

            $this->db->trans_complete();
            if ($result) {
                echo json_encode(
                    array(
                        'status' => true,
                        'message' => 'تمت العملية بنجاح',
                        'isAuth' => true
                    ),
                    JSON_UNESCAPED_UNICODE
                );
            } else {
                echo json_encode(
                    array(
                        'status' => false,
                        'message' => 'حدث خطأ أثناء العملية',
                        'isAuth' => true
                    ),
                    JSON_UNESCAPED_UNICODE
                );
            }
        }


    }

    public function clean()
    {
        // CALL unimedica_db.lab_clean()
        $this->db->query('CALL lab_clean()');
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تنظيف البيانات',
                'data' => $this->db->affected_rows(),
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function downloadImage()
    {
        $lab_id = $this->input->post('lab_id');
        $url = $this->db->query("SELECT logo FROM lab_invoice WHERE lab_hash = $lab_id")->row()->logo;
        // get path
        $path = getcwd();
        if (!file_exists("$path\uploads")) {
            mkdir("$path\uploads", 0777, true);
        }
        $path = $path . '/uploads/' . basename($url);
        shell_exec("chmod -R 777 /var/www/html/");
        // dwonload image from url to path

        $result = file_put_contents($path, file_get_contents($url), FILE_APPEND);
        $path = "http://localhost:8807/app/uploads/" . basename($url);
        $this->db->query("UPDATE lab_invoice SET logo = '$path' WHERE lab_hash = $lab_id");

        echo json_encode(
            array(
                'status' => 400,
                'message' => 'فشل تحميل الصورة',
                'data' => 'لا يمكنك تحميل الصورة',
                'isAuth' => $path
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function update_expire()
    {
        $date = $this->input->post('date');
        $lab_id = $this->input->post('lab');
        if (!isset($date) || !isset($lab_id)) {
            echo json_encode(
                array(
                    'status' => 400,
                    'message' => 'فشل تحديث تاريخ الانتهاء',
                    'data' => 'الرجاء ادخال تاريخ الانتهاء ورقم المعمل',
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
            return;
        }
        $last_expire = $this->db->query("SELECT expire_date FROM lab_expire WHERE lab_id = '$lab_id'");
        if (isset($last_expire->row()->expire_date)) {
            $this->db->query("UPDATE lab_expire SET expire_date = '$date' where lab_id = '$lab_id'");
        } else {
            $this->db->query("INSERT INTO lab_expire (lab_id, expire_date,last_code,status,user_hash) VALUES ('$lab_id', '$date','0','1','0')");
        }
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تحديث تاريخ الانتهاء',
                'data' => $this->db->affected_rows(),
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }
}