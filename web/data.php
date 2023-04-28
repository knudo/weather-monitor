<?php
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    $api_token = "<your API token>";
    $db = "<database name>";
    $url = "https://<your project name>-default-rtdb.firebaseio.com/{$db}.json?auth={$api_token}";

    // time interval for updating our json file in seconds, if its older than X seconds, we get new data from Firebase
    $interval = 1200;

    $local_file = "data.json";
    
    $data = file_get_contents($local_file);

    $last = array_key_last(json_decode($data, true));

    if((time() - $last) > $interval){
        $data = file_get_contents($url);
        
        file_put_contents($local_file, $data);
        
        $preview_file = "last.txt";

        $last = json_decode($data, true);

        $last = end($last);

        file_put_contents($preview_file, "{$last['t']}ºC | {$last['h']}%");
    }
    
    echo $data;


?>