<?php
class PointsTable {

    // simple method to take the data the table needs and generate the HTML
    // $a should be an array of Point objects
    public static function write(array $a) {
        ?>
        <table id="pointsTbl" cellpadding="0" cellspacing="0">
            <tr id="pointsTblHdr"><th>Name</th><th>X coordinate</th><th>Y coordinate</th></tr>
        <?php
        foreach ($a as $oPoint) {
            ?>
            <tr class="pointsTblRow" 
                onclick="GPSandbox.loadDetailsPrompt(<?= $oPoint->getId()?>);">
                <td><?= $oPoint->getName()?></td>
                <td><?= $oPoint->getX()?></td>
                <td><?= $oPoint->getY()?></td>
            </tr>
            <?php
        }
        ?>
        </table>
        <?php
    }
}
?>