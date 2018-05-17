<?php
date_default_timezone_set("Europe/Paris");

class JSONGenerator {
    function __construct($json) {
        $this->json = (gettype($json) === "string") ? json_decode($json) : $json;
        $this->isoDate = $this->parseISODate();
        $this->folder = __DIR__ . "../../configs";
    }

    public function validateStructure() {
        $body = $this->json->body;
        $screensaver = $body->screensaver;
        $items = $screensaver->screensaver_items;
        $errors = array(
            "messages" => array(),
            "code" => 400
        );
        $options = array(
            'options' => array(
                'min_range' => 0,
                'max_range' => 600
            )
        );

        $cleanedUrl = filter_var($body->url, FILTER_SANITIZE_URL);
        if(!filter_var($cleanedUrl, FILTER_VALIDATE_URL)){
            $errorMsg = "Validation error for the url element";
            array_push($errors["messages"], $errorMsg);
        }

        $cleanedTimeout = filter_var(intval($body->reload_timeout), FILTER_SANITIZE_NUMBER_INT);
        if(!filter_var($cleanedTimeout, FILTER_VALIDATE_INT, $options)){
            $errorMsg = "Validation error for the reload timeout element";
            array_push($errors["messages"], $errorMsg);
        }

        if($body->screen_orientation !== "landscape" && $body->screen_orientation !== "portrait") {
            $errorMsg = "Validation error for the screen orientation element";
            array_push($errors["messages"], $errorMsg);
        }

        $cleanedSaverTimeout = filter_var(intval($screensaver->screensaver_timeout), FILTER_SANITIZE_NUMBER_INT);
        if(!filter_var($cleanedSaverTimeout, FILTER_VALIDATE_INT, $options)){
            $errorMsg = "Validation error for the screensaver timeout element";
            array_push($errors["messages"], $errorMsg);
        }

        $options["options"]["max_range"] = 60;
        $cleanedSaverDelay = filter_var(intval($screensaver->screensaver_delay), FILTER_SANITIZE_NUMBER_INT);
        if(!filter_var($cleanedSaverDelay, FILTER_VALIDATE_INT, $options)){
            $errorMsg = "Validation error for the screensaver delay element";
            array_push($errors["messages"], $errorMsg);
        }

        foreach($items as $key => $item) {
            $cleaned = filter_var($item->url, FILTER_SANITIZE_URL);
            if(!filter_var($cleaned, FILTER_VALIDATE_URL)) {
                $errorMsg = "Validation error for the element "+$key+" of the screensaver items";
                array_push($errors["messages"], $errorMsg);
            }
        }
       
        return $errors;
    }

    public function createJSONConfig() {
        $errors = $this->validateStructure();
        if(sizeof($errors["messages"]) > 0) {
            return json_encode($errors);
        }

        $file = $this->isoDate . ".json";
        $fullPath = $this->folder."/".$file;
        $status = array();

        if(is_writable($fullPath)) {
            $result = file_put_contents($fullPath, json_encode($this->json));

            if($result === false) {
                $status["status"] = "An error occured during the config file saving. Please try again";
                $status["code"] = 500;
            }
            else {
                $status["status"] = "Your json config " . $file . " has been saved";
                $status["code"] = 200;
            }
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
