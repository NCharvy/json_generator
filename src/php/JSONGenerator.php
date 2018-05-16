<?php
date_default_timezone_set("Europe/Paris");

class JSONGenerator {
    function __construct($json) {
        $this->json = (gettype($json) === "string") ? json_decode($json) : $json;
        $this->isoDate = $this->parseISODate();
        $this->folder = __DIR__ . "../../configs";
    }

    public function validateStructure() {
        
    }

    public function createJSONConfig() {
        $file = $this->isoDate . ".json";
        $fullPath = $this->folder."/".$file;
        $status = array();
        if(is_writable($fullPath)) {
            $config = fopen($fullPath, 'w');
            $result = fwrite($config, json_encode($this->json));

            if($result === false) {
                $status["status"] = "An error occured during the config file saving. Please try again";
                $status["code"] = 500;
            }
            else {
                $status["status"] = "Your json config " . $file . " has been saved";
                $status["code"] = 200;
            }

            fclose($config);
        }
        else{
            $status["status"] = "The folder is not writable";
            $status["code"] = 403;
        }
        return json_encode($status);
    }

    private function parseISODate() {
        $date = date(DATE_ATOM, time());
        $date = str_replace(array("T", ":"), "-", $date);
        return explode("+", $date)[0];
    }
}
