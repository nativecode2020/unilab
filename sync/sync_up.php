<?php
// Local database credentials
$local_host = "localhost";
$local_username = "redha";
$local_password = "redhaRedha@1redha";
$local_dbname = "unimedica_db";
$port = "3306";

// Remote database credentials
$remote_host = "account.native-code-iq.com";
$remote_username = "sync";
$remote_password = "labLab123@";
$remote_dbname = "unimedica_db";

// Create connection to local database
$local_conn = mysqli_connect($local_host, $local_username, $local_password, $local_dbname, $port);
mysqli_set_charset($local_conn, "utf8");

// Check connection
if (!$local_conn) {
  die("Local connection failed: " . mysqli_connect_error());
}

// Fetch data from local table
$sql = "SELECT * FROM offline_sync where sync='0' and lab_id<>'0';";
$result = mysqli_query($local_conn, $sql);

// Check if any rows were returned
if (mysqli_num_rows($result) > 0) {

  // Create connection to remote database
  $remote_conn = mysqli_connect($remote_host, $remote_username, $remote_password, $remote_dbname);

  mysqli_set_charset($remote_conn, "utf8");

  // Check connection
  if (!$remote_conn) {
    die("Remote connection failed: " . mysqli_connect_error());
  }

  $query = " START TRANSACTION; ";
  $update_query = " START TRANSACTION; ";
  // Loop through each row and insert into remote table
  $len = 0;
  while ($row = mysqli_fetch_assoc($result)) {
    $row_id = $row["id"];
    $query = $query . $row["query"] . "; ";
    $update_query = $update_query . " update offline_sync set sync='1' where id='" . $row_id . "' " . "; ";
    $len = $len + 1;
  }

  $query = $query . "COMMIT; ";
  $update_query = $update_query . "COMMIT; ";
  //print($update_query."<br/><br/><br/><br/><br/>".$query);

  if (mysqli_multi_query($remote_conn, $query)) {
    mysqli_multi_query($local_conn, $update_query);
    echo json_encode(array(
      "status" => "is done",
      "query_length" => $len,
      "query" => $query,
    ), JSON_UNESCAPED_UNICODE);
  } else {
    echo json_encode(array("status111" => mysqli_error($remote_conn)), JSON_UNESCAPED_UNICODE);
    // echo "Error inserting record: " . mysqli_error($remote_conn);
  }


  // Close connection to remote database
  mysqli_close($remote_conn);
} else {
  echo json_encode(array("status" => "No records found in local table"), JSON_UNESCAPED_UNICODE);
  // echo "No records found in local table";
}

// Close connection to local database
mysqli_close($local_conn);
