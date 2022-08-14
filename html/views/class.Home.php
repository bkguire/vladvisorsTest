<?php
include_once('views/class.PointsTable.php');

class Home {

    public static function write(array $aPoints) {

?>
<html>
<head>
    <link rel="stylesheet" href="css/main.css">
    <script type="text/javascript" src="lib/GPSandbox.js"></script>
</head>
<body>
<div id="header">
    <h1>Graph Points Sandbox</h1>
</div>

<div id="sidebar">
</div>

<div id="main">
    <?php
    PointsTable::write($aPoints);
    ?>
    <p><input class="greenButton" type="button" name="Add Coordinate" value="Add Coordinate"
        onclick="GPSandbox.loadDetailsPrompt(0);"
    ></p>
</div>

<?php
// load data from the points table into the javascript object
$aPointsJSONReady = array();
foreach ($aPoints as $oPoint) {
    $aPointsJSONReady[] = array(
        'id' => $oPoint->getId(),
        'name' => $oPoint->getName(),
        'x' => $oPoint->getX(),
        'y' => $oPoint->getY()
    );
}
$sPointsJSON = json_encode($aPointsJSONReady, JSON_PRETTY_PRINT);
?>
<script type="text/javascript">
GPSandbox.sidebar = document.getElementById('sidebar');
GPSandbox.loadInstructions();
GPSandbox.data = <?= $sPointsJSON?>;
</script>
</body>
</html>
    <?php
    } // end write
} // end class