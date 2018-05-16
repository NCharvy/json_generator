<?php
require_once("./JSONGenerator.php");

if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest'){
	$json = file_get_contents("php://input");

	$generator = new JSONGenerator($json);

	// var_dump($generator);
	$return = $generator->createJSONConfig();

	http_response_code($return["code"]);
	echo $return;
}
