<?php
require_once('../class.VLConfig.php');
require_once('models/class.Point.php');
require_once('views/class.Home.php');

$sConnect = "host=" . VLConfig::Host . " dbname=" . VLConfig::Database
    . " user=" . VLConfig::User . " password=" . VLConfig::Pass;
if (!$db = pg_connect($sConnect)) {
    throw new Exceptiom("Unable to connect to database, check connection parameters");
}

if ($_POST['_action'] == 'ADD') {
    $oPoint = new Point();
    $oPoint->setName($_POST['pointName'])
        ->setX($_POST['x'])
        ->setY($_POST['y']);
    $oPoint->save();
    header("Location: index.php");
    exit;
} 
elseif ($_POST['_action'] == 'UPDATE') {
    $oPoint = new Point();
    $oPoint->load($_POST['id']);
    $oPoint->setName($_POST['pointName'])
        ->setX($_POST['x'])
        ->setY($_POST['y']);
    $oPoint->save();
    header("Location: index.php");
    exit;
}
elseif ($_POST['_action'] == 'DELETE') {
    $oPoint = new Point();
    $oPoint->load($_POST['id']);
    $oPoint->delete();
    header("Location: index.php");
    exit;
}
else {
    // query for all of the points
    $aPoints = Point::getAll($db);

    $sPoints = json_encode($aPoints, JSON_PRETTY_PRINT);

    Home::write($aPoints);
}
?>