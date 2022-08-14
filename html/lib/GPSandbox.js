GPSandbox = {
    sidebar: null, // populate this with the sidebar DOM element
    saveButton: null, // needs to be set by the Details prompt
    resetButton: null, // needs to be set by the Details prompt
    validationArea: null, // when the point details prompt is shown, set this
    detailsForm: null, // set this when the details prompt is loaded
    validationTimer: null, // use this to set delayed validation while user is typing
    resetButton: null, // need to set this when the details prompt is loaded
    resetPoint: null, // need to set this when the details prompt is loaded

    // data is an array that contains all the points from the database
    // each element should be an object with these properties:
    // - id
    // - name
    // - x
    // - y
    data: new Array(),

    loadInstructions: function() {
        var sHTML = '<h3>Instructions</h3>'
            + '<p>In this sandbox you are manipulating points defined by x and y coordinates.'
            + ' Click on a row to see the details of the point, edit it or delete it. While looking at the details of'
            + ' a point, you will be shown the other nearest and furthest points.</p>';
        this.sidebar.innerHTML = sHTML;
    },

    // iID should be the ID of the point, if it is zero then assume we are adding a point instead
    loadDetailsPrompt: function(iID) {
        var oPoint = {id: 0, name:'', x:'', y:''};

        // look up the point in the data array
        if (iID > 0) {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].id == iID) {
                    oPoint = this.data[i];
                }
            }
        }
        this.resetPoint = oPoint;

        var sCloseButton = "<div id=\"sidebarCloseButton\"></div>";

        var sHTML = '<h3>' + sCloseButton
            + (iID > 0 ?  'Point Details' : 'Add Point') + '</h3>'
            + '<form name="frmDetails" action="index.php" method="POST"><table>'
            + '<tr><th>Name</th><td><input name="pointName" value="' + oPoint.name + '"></td></tr>'
            + '<tr><th>X</th><td><input name="x" value="' + oPoint.x + '" size="5"></td></tr>'
            + '<tr><th>Y</th><td><input name="y" value="' + oPoint.y + '" size="5"></td></tr>'
            + '</table>'
            + '<div id="pValidation"></div>'
            + '<p><input class="orangeButton" id="btnSave" type="submit" name="Save" value="Save">'
            + '&nbsp;&nbsp;<input class="orangeButton" id="btnReset" type="reset" name="Reset" value="Reset"'
            + ' disabled>'
            + (iID > 0 ? '&nbsp;&nbsp;&nbsp;&nbsp;<input class="redButton" id="btnDelete" type="button" name="Delete" value="Delete">' : '')
            + '</p>'
            + '<input type="hidden" name="_action" value="' + (iID > 0 ? 'UPDATE' : 'ADD') + '">'
            + '<input type="hidden" name="id" value="' + iID + '">'
            + '</form>';
        this.sidebar.innerHTML = sHTML;
        document.getElementById('sidebarCloseButton').onclick = function () {
            GPSandbox.loadInstructions();
        };
        this.detailsForm = document.frmDetails;
        this.saveButton = document.getElementById('btnSave');
        this.validationArea = document.getElementById('pValidation');
        if (iID > 0) this.validatePoint(oPoint);

        // set events on the fields to perform validation
        var evtValidation = function () {
            GPSandbox.validatePoint({
                id: GPSandbox.detailsForm.id.value,
                name: GPSandbox.detailsForm.pointName.value,
                x: GPSandbox.detailsForm.x.value,
                y: GPSandbox.detailsForm.y.value
            });
            GPSandbox.enableReset(true);
        };
        this.detailsForm.pointName.onchange = evtValidation;
        this.detailsForm.x.onchange = evtValidation;
        this.detailsForm.y.onchange = evtValidation;
        
        this.enableSave(false);
        this.enableReset(false);
        if (iID > 0) this.detailsForm.Delete.onclick = function () {
            this.form._action.value = 'DELETE';
            this.form.submit();
        }
    },

    calcDistanceBtwnPoints: function(oPointA, oPointB) {

        // good old pythagorean theorem!  c-squared = a-squared + b-squared
        // first get absolute value of the difference between the x values (a)
        // then get the absolute value of the difference between the y values (b)
        // put them in the formula to get c
        var xDiff = Math.abs(oPointA.x - oPointB.x);
        var yDiff = Math.abs(oPointA.y - oPointB.y);
        return Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
    },

    listRelativePoints: function(oOrigin, sNearOrFar) {
        var reNearOrFar = /^(NEAR|FAR)$/;
        if (!reNearOrFar.test(sNearOrFar)) {
            alert("listRelativePoints: second parameter must be either NEAR or FAR");
            return;
        }

        var oReturn = (sNearOrFar == 'NEAR' ? this.getNearbyPoints(oOrigin) : this.getFarthestPoints(oOrigin));

        var sHeading = '';
        if (oReturn.distance == 0) return '';
        else {
            sHeading = (sNearOrFar == 'NEAR' ? 'Nearest' : 'Farthest')
                + (oReturn.points.length > 1 ? ' points' : ' point')
                + ' at distance ' + Math.round(oReturn.distance * 10) / 10;

            var sTable = '<table class="tblRelative" cellpadding="0" cellspacing="0"><tr><th>Name</th><th>X</th><th>Y</th></tr>';
            for (let i = 0; i < oReturn.points.length; i++) {
                sTable += '<tr><td>' + oReturn.points[i].name + '</td><td>'
                    + oReturn.points[i].x + '</td><td>' + oReturn.points[i].y
                    + '</td></tr>';
            }
            sTable += '</table>';

            return '<p>' + sHeading + sTable + '</p>';
        }
    },

    // return an object that contains the nearest point, aside from the origin
    // as well as the distance
    // if there are no other points in the set, return an empty array
    // return more than one only if they are a tie for the nearest
    getNearbyPoints: function(oOrigin) {

        var aReturn = new Array();
        var fClosestDistance = null;
        for (let i = 0; i < this.data.length; i++) {
            let oTestPoint = this.data[i];
            if (oTestPoint.id != oOrigin.id) {
                let fDistance = this.calcDistanceBtwnPoints(oOrigin, oTestPoint);
                if (fDistance < fClosestDistance || fClosestDistance == null) {
                    aReturn = new Array();
                    aReturn.push(oTestPoint);
                    fClosestDistance = fDistance;
                }
                else if (fDistance == fClosestDistance) {
                    aReturn.push(oTestPoint);
                }
            }
        }
        
        return {
            distance: fClosestDistance,
            points: aReturn
        };
    },

    getFarthestPoints: function(oOrigin) {
        var aReturn = new Array();
        var fFarthestDistance = null;
        for (let i = 0; i < this.data.length; i++) {
            let oTestPoint = this.data[i];
            if (oTestPoint.id != oOrigin.id) {
                let fDistance = this.calcDistanceBtwnPoints(oOrigin, oTestPoint);
                if (fDistance > fFarthestDistance || fFarthestDistance == null) {
                    aReturn = new Array();
                    aReturn.push(oTestPoint);
                    fFarthestDistance = fDistance;
                }
                else if (fDistance == fFarthestDistance) {
                    aReturn.push(oTestPoint);
                }
            }
        }
        return {
            distance: fFarthestDistance,
            points: aReturn
        };
    },

    enableSave: function(bEnable) {
        this.saveButton.disabled = !bEnable;
    },

    enableReset: function(bEnable) {
        this.detailsForm.Reset.disabled = !bEnable;
    },

    // set the validation area of the details prompt
    // if there are errors, display them
    // else, try to display the nearest and farthest points
    // we may be validating a new point or an existing point
    // we need to make sure the name is unique (does not match the name of any other point)
    validatePoint: function(oPoint) {
        var aReturn = new Array();

        var reName = /^[a-zA-Z0-9]+$/;
        var reCoord = /^-?[0-9]+$/;

        if (!reName.test(oPoint.name)) {
            aReturn.push("Name is invalid, please use only letters and numbers");
        } 
        if (!reCoord.test(oPoint.x)) {
            aReturn.push("X coordinate must be an integer");
        } 
        if (!reCoord.test(oPoint.y)) {
            aReturn.push("Y coordinate must be an integer");
        }

        for (let i = 0; i < this.data.length; i++) {
            if (oPoint.id != this.data[i].id) {
                if (oPoint.name == this.data[i].name) {
                    aReturn.push("Name is not unique");
                    break;
                }
            }
        }

        if (aReturn.length > 0) {
            var sHTML = "<p><b>Errors:</b>";
            for (let i = 0; i < aReturn.length; i++) {
                sHTML += "<br>- " + aReturn[i];
            }
            sHTML += "</p>";
            this.validationArea.innerHTML = sHTML;
            this.enableSave(false);
            return;
        }

        this.validationArea.innerHTML = this.listRelativePoints(oPoint, 'NEAR')
            + this.listRelativePoints(oPoint, 'FAR');
        this.enableSave(true);
    },

    reset: function () {
        GPSandbox.detailsForm.pointName.value = GPSandbox.resetPoint.name;
        GPSandbox.detailsForm.x.value = GPSandbox.resetPoint.x;
        GPSandbox.detailsForm.y.value = GPSandbox.resetPoint.y;
        GPSandbox.validatePoint(GPSandbox.resetPoint);
    }
};