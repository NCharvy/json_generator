<?php
require_once("./JSONGenerator.php");

// execute the rest of the script only if the request is an XHR
if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest'){
	// get the json data
	$json = file_get_contents("php://input");
	// initialize the json generator
	$generator = new JSONGenerator($json);

	// prints the generation response
	echo $generator->createJSONConfig();
}
