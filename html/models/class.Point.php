<?php
class Point {
    private $id;
    private $name;
    private $x;
    private $y;

    public function __construct() {
    }

    public function load(int $id) {
        $sSQL = "SELECT * FROM point WHERE id = $id";
        if (!$rPoint = pg_query($sSQL)) {
            throw new Exception("Points table select query: " . pg_last_error());
        }
        $aPoint = pg_fetch_assoc($rPoint);
        $this->id = $aPoint['id'];
        $this->name = $aPoint['name'];
        $this->x= $aPoint['x'];
        $this->y = $aPoint['y'];
    }

    public function save() {
        if ($this->id) {
            $sSQL = "UPDATE point SET name = '{$this->name}', x = {$this->x}, y = {$this->y}"
                . " WHERE id = {$this->id}";
        }
        else {
            $sSQL = "INSERT INTO point (name, x, y) VALUES("
            . "'{$this->name}', {$this->x}, {$this->y})";
        }
        if (!pg_query($sSQL)) {
            throw new Exception("Point insert/replace query: " . pg_last_error());
        }
    }
    public function delete() {
        if (!$this->id) {
            throw new Exception("No point loaded, nothing to delete");
        }
        $sSQL = "DELETE FROM point WHERE id = {$this->id}";
        if (!pg_query($sSQL)) {
            throw new Exception("Point delete query: " . pg_last_error);
        }
    }

    public function getId() {
        return $this->id;
    }

    public function getName() {
        return $this->name;
    }

    public function getX() {
        return $this->x;
    }

    public function getY() {
        return $this->y;
    }

    public function setName(string $s) {
        $this->name = $s;
        return $this;
    }

    public function setX(int $i) {
        $this->x = $i;
        return $this;
    }

    public function setY(int $i) {
        $this->y = $i;
        return $this;
    }

    public static function getAll() {
        $sSQL = "SELECT id FROM point ORDER BY name";
        if (!$rPoints = pg_query($sSQL)) {
            throw new Exception("Points select query: " . pg_last_error());
        }

        $aReturn = array();
        while ($aPoint = pg_fetch_assoc($rPoints)) {
            $o = new Point();
            $o->load($aPoint['id']);
            $aReturn[] = $o;
        }
        
        return $aReturn;
    }
}
?>