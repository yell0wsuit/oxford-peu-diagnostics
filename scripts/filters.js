angular
    .module("myApp.filters", [])
    .filter("sanitize", [
        "$sce",
        function ($sce) {
            return function (text) {
                if (typeof text != "undefined" && typeof text == "string") {
                    return $sce.trustAsHtml(text);
                }
            };
        },
    ])
    .filter("singleText", function () {
        return function (obj) {
            if (typeof obj["text"] != "undefined" && obj["text"].indexOf("#singletouch") != -1) {
                var temp = obj["text"];

                temp = temp.split("#singletouch");

                var part = "";
                angular.forEach(temp, function (value, key) {
                    value = value.trim();

                    if (value != "  " && value != "") {
                        part += "<div class='ques'>" + value + " </div>";
                    } else {
                        part += "<div class='ques empty'>" + value + "</div>";
                    }
                    if (obj.hasOwnProperty("option") && typeof obj["option"][key] != "undefined") {
                        angular.forEach(obj["option"][key], function (valuein, keyin) {
                            part += "<div class='userInput' ng-click='userSelect($event)'  data-group='" + key + "'>" + valuein + "</div>";
                        });
                        // part += "<div class='userInput' ng-click='userSelect($event)'  data-group='0'>" + obj["option"][key] + "</div>";
                    }
                });
                return part;
            }
        };
    })
    .filter("gapText", function () {
        console.log("gapText");
        return function (obj) {
            if (typeof obj != "undefined" && typeof obj == "string") {
                var temp = obj.split("#gap");
                angular.forEach(temp, function (value, key) {
                    if (value != " " && value != "") {
                        temp[key] = "<div class='ques'>" + value + "</div>";
                    } else {
                        temp[key] = "<div class='ques empty'>" + value + "</div>";
                    }
                });
                temp = temp.join(
                    "<div style='display:inline-block'><textarea rows='1' cols='1' class='gapFill' autocorrect='off' autocapitalize='none' spellcheck='false'></textarea></div>"
                );
                return temp;
            }
        };
    })
    .filter("multiTouchText", function () {
        console.log("multiTouchText");
        return function (obj) {
            if (typeof obj["text"] != "undefined") {
                var temp = obj["text"];
                var part = "";
                angular.forEach(temp, function (value, key) {
                    if (value != "  " && value != "") {
                        part += "<div class='ques'>" + value + " </div>";
                    } else {
                        part += "<div class='ques empty'>" + value + " </div>";
                    }

                    if (obj.hasOwnProperty("option") && typeof obj["option"][key] != "undefined") {
                        angular.forEach(obj["option"][key], function (valuein, keyin) {
                            part += "<div class='userInput' ng-click='userSelect($event)'  data-group='" + key + "'>" + valuein + "</div>";
                        });
                    }
                });

                return part;
            }
        };
    })
    .filter("dropText", function () {
        console.log("dropText");
        return function (obj) {
            if (typeof obj != "undefined" && typeof obj == "string" && obj.indexOf("#drop") != -1) {
                var temp = obj.split("#drop");
                angular.forEach(temp, function (value, key) {
                    if (value != " " && value != "") {
                        temp[key] = "<div class='dnd_ques'style='display:inline'>" + value + "</div>";
                    } else {
                        temp[key] = "<div class='dnd_ques empty' style='display:inline'>" + value + "</div>";
                    }
                });
                temp = temp.join("<div class='feedbackDiv' style='display:inline'><ng-drop append='true'></ng-drop></div>");
                return temp;
            }
        };
    });
