<?php
// Instructions
// 
// php dashku_WIDGETID.php
//
// This code is courtesy of 
// Dan Morgan
//
// http://www.danmorgan.net/programming/simple-php-json-rest-post-client/
// 
function restcall($url,$vars) {
 $headers = array(
 'Accept: application/json',
 'Content-Type: application/json',
 );
 $data = $vars;
 
 $handle = curl_init();
 curl_setopt($handle, CURLOPT_URL, $url);
 curl_setopt($handle, CURLOPT_HTTPHEADER, $headers);
 curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
 curl_setopt($handle, CURLOPT_SSL_VERIFYHOST, false);
 curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);
 
 curl_setopt($handle, CURLOPT_POST, true);
 curl_setopt($handle, CURLOPT_POSTFIELDS, $data);
 
 $response = curl_exec($handle);
 $code = curl_getinfo($handle, CURLINFO_HTTP_CODE);
 return $response;
}

restcall("THEURL",'JSONDATA');