var app = angular.module("myApp", [
    "ngTouch",
    "myApp.mRadioCtrl",
    "myApp.single_radio",
    "myApp.mRadioTextCtrl",
    "myApp.orderSentence",
    "ui.sortable",
    "myApp.multi_touch_button",
    "myApp.single_touch_button",
    "myApp.correctionSent",
    "myApp.mgapFill",
    "myApp.dndCtrl",
    "myApp.freeText",
    "myApp.summaryCtrl",
    "myApp.filters",
]);
var scormApi = new Scrom();
var main_data = [];
var mFlag;
var uAnswer = {};

app.controller("mainCtrl", function ($rootScope, $scope, $http, $templateRequest, $compile) {
    // $scope.deleteAll = false;
    scormApi.getExcercisedata(function (main) {
        $("#iLoader").addClass("d-none");
        $rootScope.main = main.data;
        $scope.hoverC = "";
        $rootScope.d = {};
        $rootScope.fIndex;
        $rootScope.fLevel;

        $scope.template = "templates/blank.html";
        $rootScope.go = function (level, index, _topic) {
            mFlag = false;
            $("#iLoader").removeClass("d-none");
            $rootScope.fIndex = level;
            $rootScope.fLevel = index;
            $rootScope.main[index]["status"][level] = 2;
            scrollToStart();

            main_data = $rootScope.main;
            $rootScope.loadJson(level, index, _topic);
        };

        $scope.load_section = function () {
            $(".header").css("display", "table");
            scrollToStart();

            if ($(".resultFeedback").length > 0 && typeof uAnswer[$rootScope.fLevel] != "undefined") {
                uAnswer[$rootScope.fLevel]["desc"] = $(".resultFeedback").text();
            }
            if ($rootScope.summary) {
                uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
            }
            $rootScope.d.topic = "List of tests";
            $rootScope.summary = false;
            $scope.activity = false;
            $(".home_page").hide();
            $(".learningRec,.topicFooter").fadeIn(300);
        };
        $scope.help_btn = function () {
            var OpenWindow = window.open("templates/Help.html", "Help Document", "");
        };
        $scope.loadTemplate = function () {
            $scope.activity = true;
            setTimeout(function () {
                if ($(".questionSet").length == 1 || $(".questionSet_orderdnd").length == 1) {
                    $(".questionSet,.questionSet_orderdnd").addClass("bef");
                }
            });
            if ($rootScope.summary) {
                if (typeof $rootScope.uData[$rootScope.d.curr] != "undefined" && $rootScope.uData[$rootScope.d.curr] != null) {
                    $(".template").last().find(".btn").css({ position: "absolute", "z-index": "-999", opacity: "0" });
                    $(".template")
                        .last()
                        .append(
                            '<button type="button" ng-click="try(' +
                                $rootScope.d.curr +
                                ')" class="btn btn-secondary tryAgain" data-index="' +
                                $rootScope.d.curr +
                                '">Try again</button>'
                        );
                    $rootScope.userStoredAnswer($rootScope.uData[$rootScope.d.curr]);
                } else {
                    $(".current").html(
                        '<div class="emptyDiv"><div class="noResTitle"><div class="rubric"><span class="rubricNo">' +
                            ($rootScope.d.curr + 1) +
                            '</span> <span class="rubricText">No results</span></div></div><button type="button" ng-click="try(' +
                            $rootScope.d.curr +
                            ')" data-index="' +
                            $rootScope.d.curr +
                            '" class="btn btn-secondary tryAgain">Try</div></button>'
                    );
                    $(".template").removeClass("current").removeClass("template");
                }
            } else {
                if ($rootScope.d.curr < $rootScope.d.size - 1) {
                    $("#iLoader").addClass("d-none");
                    $(".template").append('<div class="btn btn-secondary endTest">Exit test</div>');
                    $(".endTest").bind("click", function () {
                        $rootScope.$apply(function () {
                            $scope.results($rootScope.fLevel, $rootScope.fIndex);
                        });
                    });
                }
            }
        };
        $scope.results = function (level, index, _topic) {
            //console.log("level-->" + level);
            //console.log("index---->" + index);
            $(".summaryWrapper").show();
            scrollToStart();
            $("#iLoader").removeClass("d-none");

            $(".summary").empty();
            if (typeof index != "undefined") {
                $rootScope.fIndex = index;
            }

            $scope.template = "templates/blank.html";
            var fname = "data_" + $rootScope.fIndex;
            scormApi.getuserData(fname, function (udata) {
                if (typeof udata != "object") {
                    udata = {};
                }
                uAnswer = udata;
                $http.get("db/data_" + $rootScope.fIndex + ".json").success(function (data) {
                    if (level == 0) {
                        level = "b2";
                    } else if (level == 1) {
                        level = "c1";
                    } else if (level == 2) {
                        level = "c2";
                    }
                    if (typeof level != "undefined") {
                        $rootScope.fLevel = level;
                    }
                    $rootScope.ogData_ = JSON.stringify(data.topic);
                    $rootScope.data = data[level];
                    var curr = 0;
                    $rootScope.d = { topic: $rootScope.main[$rootScope.fIndex]["text"], exercise: $rootScope.data.exercise[curr] };
                    $rootScope.d.curr = curr;
                    $rootScope.d.level = $rootScope.fLevel;
                    if (udata.hasOwnProperty(level) && udata[level].hasOwnProperty("exerciseData")) {
                        $rootScope.uData = udata[level]["exerciseData"];
                    } else {
                        udata[level] = {};
                        udata[level]["exerciseData"] = [];
                        $rootScope.uData = udata[level]["exerciseData"];
                    }

                    $rootScope.d.size = $rootScope.data.exercise.length;
                    $scope.activity = true;
                    $rootScope.resetData();
                    $scope.template = "templates/summary.html";
                });
            });
        };
        $scope.tryAgain = function (level, index, _topic) {
            $scope.activity = true;
            $scope.template = "templates/blank.html";
            setTimeout(function () {
                $scope.template = "templates/" + $rootScope.d.exercise["template"] + ".html";
            });
        };
    });
    $rootScope.resetData = function (curr) {
        if ($rootScope.d.exercise["template"] == "order_sentence" && typeof $rootScope.d.exercise["question"][0]["text"][0] != "object") {
            angular.forEach($rootScope.d.exercise["question"], function (value, key) {
                $rootScope.d.exercise["question"][key]["class"] = "list_" + key;
                $rootScope.d.exercise["question"][key]["last"] =
                    $rootScope.d.exercise["question"][key]["text"][$rootScope.d.exercise["question"][key]["text"].length - 1];
                $rootScope.d.exercise["question"][key]["text"].pop();
                $rootScope.d.exercise["question"][key]["text"] = shuffleArray($rootScope.d.exercise["question"][key]["text"]);
                angular.forEach($rootScope.d.exercise["question"][key]["text"], function (value1, key1) {
                    $rootScope.d.exercise["question"][key]["text"][key1] = {};
                    $rootScope.d.exercise["question"][key]["text"][key1]["item"] = value1;
                });
            });
        } else if ($rootScope.d.exercise["template"] == "dragdrop_notrans" && typeof $rootScope.d.exercise["option"][0] != "object") {
            if (!$rootScope.d.exercise.hasOwnProperty("clone")) {
                $rootScope.d.exercise["clone"] = false;
            }
            angular.forEach($rootScope.d.exercise["option"], function (value, key) {
                $rootScope.d.exercise["option"][key]["class"] = "list_" + key;
                $rootScope.d.exercise["option"][key] = {};
                $rootScope.d.exercise["option"][key]["text"] = value;
            });
        } else if ($rootScope.d.exercise["template"] == "single_radio") {
            angular.forEach($rootScope.d.exercise["question"], function (value, key) {
                angular.forEach($rootScope.d.exercise["question"][key]["option"], function (valuein, keyin) {
                    var str = valuein;
                    valuein = str.replace(/<(?:.|\n)*?>/gm, "");
                    str = $rootScope.d.exercise["question"][key]["answer"];
                    $rootScope.d.exercise["question"][key]["answer"] = str.replace(/<(?:.|\n)*?>/gm, "");
                    if (valuein == $rootScope.d.exercise["question"][key]["answer"]) {
                        $rootScope.d.exercise["question"][key]["rIndex"] = keyin;
                    }
                });
            });
        }
    };
    $rootScope.loadJson = function (level, index, _topic) {
        //console.log("level-->" + level);
        //console.log("index---->" + index);
        //console.log(_topic);
        uAnswer = {};
        $rootScope.fIndex = index;
        $http.get("db/data_" + index + ".json").success(function (data) {
            if (level == 0) {
                level = "b2";
            } else if (level == 1) {
                level = "c1";
            } else {
                level = "c2";
            }
            $rootScope.fLevel = level;
            $rootScope.ogData_ = JSON.stringify(data.topic);
            $rootScope.data = data[level];
            var curr = 0;
            $rootScope.d = { topic: _topic, exercise: $rootScope.data.exercise[curr] };
            $rootScope.d.curr = curr;
            $rootScope.d.level = level;
            $rootScope.d.size = $rootScope.data.exercise.length;
            $rootScope.activity = false;
            $rootScope.uData = [];
            $rootScope.summary = false;
            $rootScope.resetData();

            scormApi.checkUserAnswer(index, function (flag) {
                if (flag) {
                    var fname = "data_" + index;
                    scormApi.getuserData(fname, function (udata) {
                        uAnswer = udata;
                        //   $scope.template = "templates/" + $rootScope.d.exercise["template"] + ".html";
                    });
                } else {
                    //console.log("templates/" + $rootScope.d.exercise["template"] + ".html");
                    // $scope.template = "templates/" + $rootScope.d.exercise["template"] + ".html";
                }
            });
            $scope.template = "templates/" + $rootScope.d.exercise["template"] + ".html";
        });
    };

    $rootScope.nextExercise = function () {
        scrollToStart();
        $("#iLoader").removeClass("d-none");
        $scope.disable = false;
        if ($rootScope.d.curr < $rootScope.d.size - 1) {
            $scope.template = "templates/blank.html";
            $rootScope.d.curr++;
            $rootScope.d.exercise = $rootScope.data.exercise[$rootScope.d.curr];
            setTimeout(function () {
                $rootScope.resetData();
                $scope.template = "templates/" + $rootScope.d.exercise["template"] + ".html";
                $("#iLoader").addClass("d-none");
            });
        } else {
            scrollToStart();
            $scope.activity = true;
            $scope.template = "templates/summary.html";
        }
    };
    $scope.checkData = function (a) {
        if (typeof a != "undefined" && a != "") {
            return false;
        } else {
            return true;
        }
    };
});
angular.module("myApp.summaryCtrl", []).controller("summaryCtrl", function ($scope, $rootScope, $filter, $timeout, $templateRequest, $compile) {
    $(".myApp").css({ height: "500px", position: "relative", overflow: "hidden" });
    $("#iLoader").removeClass("d-none");
    var tplC = angular.element(".summary"); //template container
    var data = $scope.data.exercise,
        c = 0;
    $rootScope.d.curr = 0;
    $rootScope.goInner = function () {
        scrollToStart();
        $rootScope.uData = [];
        $rootScope.d.curr = 0;
        $rootScope.summary = false;
        $rootScope.d.exercise = $rootScope.data.exercise[$rootScope.d.curr];
        if (typeof uAnswer[$rootScope.fLevel] != "undefined") {
            uAnswer[$rootScope.fLevel]["desc"] = $(".resultFeedback").text();
            uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
        }

        $scope.tryAgain();
    };

    function a() {
        $("#iLoader").removeClass("d-none");
        $templateRequest("templates/" + data[c].template + ".html").then(function (html) {
            $rootScope.d.exercise = data[c];
            $rootScope.resetData();
            html1 = $compile(html)($scope);
            var x = $("<div>");
            x.addClass("temp").addClass("current");
            x.appendTo($(".myApp"));
            x.append(html1);
            $timeout(function () {
                $rootScope.summary = true;
                $scope.loadTemplate();
            }, 20);
            $timeout(function () {
                //console.log("-------------------------");
                //console.log("----------Loading...." + data[c].template + "---------------");
                //console.log("-------------------------");
                tplC.append(x.html());
                $(".temp").remove();
                angular.element(".template *").unbind();
                $(".template").removeClass("template");
                c++;
                $rootScope.d.curr = c;
                if (c < data.length) {
                    a();
                } else {
                    //console.log("-------------------------");
                    //console.log("----------All template loaded---------------");
                    //console.log("-------------------------");
                    scrollToStart();

                    $(".myApp").removeAttr("style");
                    $("#iLoader").addClass("d-none");
                    $(".radioRow").find(".iconParent").removeClass("clicked");
                    if (typeof uAnswer[$rootScope.fLevel] != "undefined" && typeof uAnswer[$rootScope.fLevel]["index"] != "undefined") {
                        $(".radioRow").eq(uAnswer[$rootScope.fLevel]["index"]).find(".iconParent").addClass("clicked");
                    }
                    $(".resultFeedback").text("");
                    if (typeof uAnswer[$rootScope.fLevel] != "undefined" && typeof uAnswer[$rootScope.fLevel]["desc"] != "undefined") {
                        $(".resultFeedback").text(uAnswer[$rootScope.fLevel]["desc"]);
                    }
                    $(".radioRow")
                        .off("click")
                        .on("click", function () {
                            var index = $(this).attr("data-index");
                            uAnswer[$rootScope.fLevel]["index"] = index;
                            $(".iconParent").removeClass("clicked");
                            $(this).find($(".iconParent")).addClass("clicked");
                        });
                    $(".tryAgain").click(function () {
                        //location.reload();
                        var i = Number($(this).attr("data-index"));
                        scrollToStart();
                        if (typeof uAnswer[$rootScope.fLevel] != "undefined") {
                            uAnswer[$rootScope.fLevel]["desc"] = $(".resultFeedback").text();
                            uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
                        }
                        $scope.$apply(function () {
                            $rootScope.activity = true;
                            $rootScope.uData[i] = {};
                            $rootScope.d.curr = i;
                            $rootScope.d.exercise = $rootScope.data.exercise[i];
                            $rootScope.resetData();
                            $rootScope.summary = false;
                            $scope.tryAgain();
                        });
                    });
                }
            }, 50);
        });
    }
    $timeout(function () {
        $scope.loadTemplate();
        $rootScope.d.curr = 0;
        a();
    }, 0);
});
angular.module("myApp.dndCtrl", ["dnd"]).controller("dndCtrl", function ($rootScope, $scope, $compile, $filter, $timeout, $element) {
    $(".template").last().addClass("dnd").addClass("current");
    var w = 0;
    var arr = [];
    $(".checkAns").hide();
    $scope.loadTemplate();
    $timeout(function () {
        if ($rootScope.d.exercise.hasOwnProperty("display")) {
            $(".dnd_text").css("display", "flex");
            $(".dnd_text").css("display", "-webkit-flex;");
        }
        if ($(".current .dnd_text").length == 1) {
            $(".current .dnd_text").addClass("onlyElem");
        }
        $compile(angular.element("ng-drop"))($scope);
        $(".current .dnd_text").each(function (i) {
            var txt = $(this).find(".dnd_ques").last().text();
            txt = txt.trim();
            //console.log(txt);
            if (txt.length == 1) {
                var prev = $(this).find(".dnd_ques").last().prev();

                $(prev).append($(this).find(".dnd_ques").last());
            }
        });

        $(".current .ui-droppable").width(w + 40);
    });
    $scope.setW = function () {
        $(".current .options").attr("min-height", $(".options").height() + "px");
        angular.forEach(angular.element(".current .drags"), function (value, key) {
            if (w < angular.element(value).width()) {
                w = angular.element(value).width();
                w = Math.round(w) + 1;
            }
        });
        $(".current .drags").width(w);
        $(".current .dragC").css("min-width", w + 45 + "px");
    };

    $scope.checkAnswer = function () {
        updateAtag();
        $scope.disable = true;
        var a = $rootScope.d.exercise.question;
        var el, temp;
        var rAns = [];
        if ($rootScope.d.exercise.hasOwnProperty("alphaOrder")) {
            rAns = a[0].answer[0].slice();
        }
        for (var i in a) {
            var tempDiv = $(".current .q_row li").eq(i).find(".feedbackDiv");
            el = $(".current .q_row li").eq(i);
            //tempDiv = $(tempDiv);
            // el.append(tempDiv)
            var ans = "";
            if (el.find(".drags span").length > 0) {
                if ($rootScope.d.exercise.hasOwnProperty("alphaOrder")) {
                    temp = el.find(".drags span").text().trim();
                    var flag = rAns.indexOf(temp);
                    if (flag != -1) {
                        ans = "correct";
                        rAns.splice(flag, 1);
                    } else {
                        ans = "incorrect";
                        if (!$rootScope.d.exercise.hasOwnProperty("hideRight")) {
                            tempDiv.prepend('<div class="feedback">' + rAns[0] + "</div>");
                            rAns.push(rAns.shift());
                        }
                    }
                } else {
                    if (typeof a[i].answer != "object") {
                        if (a[i].answer.right.trim() == el.find(".drags span").text().trim()) {
                            ans = "correct";
                        } else {
                            ans = "incorrect";
                            if (!$rootScope.d.exercise.hasOwnProperty("hideRight")) {
                                tempDiv.prepend('<div class="feedback">' + a[i].answer.right + "</div>");
                            }
                        }
                    } else {
                        if (a[i].answer[0].indexOf(el.find(".drags span").text()) != -1) {
                            ans = "correct";
                        } else {
                            ans = "incorrect";
                            if (!$rootScope.d.exercise.hasOwnProperty("hideRight")) {
                                tempDiv.prepend('<div class="feedback">' + a[i].answer[0][0] + "</div>");
                            }
                        }
                    }
                }

                tempDiv.prepend('<div class="status ' + ans + ' tick"></div>');
                tempDiv.prepend($(".current .q_row li").eq(i).find(".ui-droppable"));
                //tempDiv.css("float", "left");
                arr[i] = el.find(".ui-draggable").attr("index");
            }
            if (!$rootScope.summary) {
                $(".linkFeedback").slideDown(300);
            } else {
                $(".linkFeedback").show();
            }
        }

        $rootScope.uData[$rootScope.d.curr] = arr;
        if (!$rootScope.summary) {
            uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
        }
        $(".current .feedback").css("width", w + 40 + "px");
        $(".current .feedback").show();
        $(".current .drags").draggable("disable");
        $(".skip,.checkAns").hide();
        $(".next,.endTest").show();
    };
    $rootScope.userStoredAnswer = function (arr) {
        $(".current .drags").draggable("disable");
        angular.forEach(arr, function (value, key) {
            if (!$rootScope.d.exercise["clone"]) {
                $(".current  .ui-droppable")
                    .eq(key)
                    .append($('.current  .drags[index="' + value + '"]'));
            } else {
                var temp = $('.current  .drags[index="' + value + '"]')
                    .first()
                    .clone();
                $(".current  .ui-droppable").eq(key).append(temp);
            }
        });
        angular.element(".current .checkAns").triggerHandler("click");
        $(".template").removeClass("current").removeClass("template");
    };
});
angular.module("myApp.orderSentence", []).controller("orderSentence", function ($rootScope, $scope, $filter, $timeout) {
    $(".template").addClass("orderSentence").addClass("current");
    $scope.disable = false;
    $scope.loadTemplate();
    $timeout(function () {
        updateAtag();
        if ($(".current .questionSet_orderdnd").length == 1) {
            $(".current .questionSet_orderdnd").addClass("onlyElem");
        }
        var max = 0;
        angular.forEach(angular.element(".current .reorderOptions"), function (value, key) {
            var a = angular.element(value).width();
            a = Math.round(a) + 40;
            if (a > max) {
                max = a;
            }
        });
        $(".current .reorderli:not(:last-child)").css("width", max + "px");
        $(".current .reorderOptions").css("width", max + "px");
    });
    $scope.sortableOptions = {
        containment: "parent",
        stop: function (e, ui) {
            $(ui.item).parent().removeClass("itemMoved").addClass("itemMoved");
            if ($(".itemMoved").length == $(".quesWrap ").length) {
                $(".checkAns").show();
            }
        },
    };
    $(".current .status").removeClass("correct");
    $(".current .status").removeClass("incorrect");
    $scope.checkAnswer = function (e, _val) {
        if (!$rootScope.summary) {
            $rootScope.uData[$rootScope.d.curr] = {};
            $rootScope.uData[$rootScope.d.curr].template = $rootScope.d.exercise["template"];
            $rootScope.uData[$rootScope.d.curr]["answer"] = [];
        }
        $(".current .order_activityArea").css("position", "relative");
        $scope.disable = true;
        var _flag = false;
        $(".current .quesWrap").each(function (quesInd) {
            if (!$rootScope.summary) {
                $rootScope.uData[$rootScope.d.curr]["answer"][quesInd] = [];
            }
            var _this = $(this);
            _flag = false;
            $(this)
                .find(".qword")
                .each(function (e) {
                    var userAns = clean($(this).find(".reorderOptions").text());
                    if (!$rootScope.summary) {
                        $rootScope.uData[$rootScope.d.curr]["answer"][quesInd].push($(this).find(".reorderOptions").text());
                    }
                    if (typeof $rootScope.d["exercise"]["question"][quesInd]["answer"] != "object") {
                        var ans = $rootScope.d["exercise"]["question"][quesInd]["answer"];
                    } else {
                        var ans = $rootScope.d["exercise"]["question"][quesInd]["answer"][0];
                    }
                    ans = clean(ans);
                    ans = ans.split(" ");
                    var rans = ans[e].toLowerCase().trim();
                    if (userAns != rans && !_flag) {
                        _flag = true;
                        ans = ans.join(" ");
                        if (typeof $rootScope.d["exercise"]["question"][quesInd]["answer"] != "object") {
                            var fbans = $rootScope.d["exercise"]["question"][quesInd]["answer"];
                        } else {
                            var fbans = $rootScope.d["exercise"]["question"][quesInd]["answer"][0];
                        }
                        if (!$rootScope.d.exercise.hasOwnProperty("hideRight")) {
                            $(_this)
                                .parent()
                                .append('<div class="feedback">' + fbans + " </div>");
                        }
                        if (!$rootScope.summary) {
                            $(_this).next().slideDown(300);
                        } else {
                            $(_this).next().show();
                        }
                    }
                });
            if (_flag) {
                $(this).find(".status").addClass("incorrect");
            } else {
                $(this).find(".status").addClass("correct");
            }
        });
        if ($(".current .linkFeedback").find("li").length > 0) {
            if (!$rootScope.summary) {
                $(".current .linkFeedback").slideDown(300);
            } else {
                $(".current .linkFeedback").show();
            }
        }
        if (!$rootScope.summary) {
            uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
        }
        $(".endTest").show();
    };
    $rootScope.userStoredAnswer = function (arr) {
        arr = arr.answer;
        $(".current .quesWrap").each(function (quesInd) {
            $(this)
                .find(".qword")
                .each(function (e) {
                    $(this).find(".reorderOptions").html(arr[quesInd][e]);
                });
        });
        angular.element(".current .checkAns").triggerHandler("click");
        $(".template").removeClass("current").removeClass("template");
    };
});
//////////////////////////////////gap Fill////////////////////////////////////////////
angular.module("myApp.mgapFill", []).controller("mgapFill", function ($rootScope, $scope, $filter, $timeout, $compile) {
    //console.log("gap fill");
    $(".template").addClass("current").addClass("mgapFill");
    $scope.loadTemplate();
    $scope.checkAnswer = function (e, _val) {
        var a = $rootScope.d.exercise.question;
        var rAns = [];
        if ($rootScope.d.exercise.hasOwnProperty("alphaOrder")) {
            for (var j in a) {
                rAns[j] = [];
                rAns[j] = a[j].answer.slice();
            }
        }
        if (!$rootScope.summary) {
            $rootScope.uData[$rootScope.d.curr] = {};
            $rootScope.uData[$rootScope.d.curr].template = $rootScope.d.exercise["template"];
            $rootScope.uData[$rootScope.d.curr]["answer"] = [];
        }
        $scope.disable = true;
        var correct_flag, _this, userAns, ans, rans, rans1;
        $(".current .qTxt").each(function (quesInd) {
            _this = $(this);
            $(this)
                .find(".gapFill")
                .each(function (e) {
                    userAns = $(this).val();
                    ans = $rootScope.d["exercise"]["question"][quesInd]["answer"];
                    if (!$rootScope.d.exercise.hasOwnProperty("alphaOrder")) {
                        rans = ans[e];
                        if ($rootScope.d.exercise.hasOwnProperty("ignorePunctuate")) {
                            correct_flag = checkAns(userAns, rans, true);
                        } else {
                            correct_flag = checkAns(userAns, rans);
                        }
                    } else {
                        userAns = userAns.replace(/\s+/g, " ");
                        userAns = userAns.trim();
                        var ind = rAns[quesInd].indexOf(userAns);
                        if (ind != -1) {
                            rAns[quesInd].splice(ind, 1);
                            correct_flag = true;
                        } else {
                            correct_flag = false;
                        }
                    }
                    if (userAns != "") {
                        var temp1 = document.createElement("div");
                        $(this).after(temp1);
                        $(temp1).css("display", "inline-block");
                        $(temp1).css("float", "left");
                        $(temp1).append($(this));
                        if (!correct_flag) {
                            if (!$rootScope.d.exercise.hasOwnProperty("hideRight")) {
                                $(temp1).append('<div class="status incorrect"></div>');
                                if (typeof ans == "object") {
                                    $(temp1)
                                        .parent()
                                        .append('<div class="feedback" style="margin-bottom:5px">' + ans[e][0] + " </div>");
                                } else {
                                    $(temp1)
                                        .parent()
                                        .append('<div class="feedback" style="margin-bottom:5px">' + ans[e] + " </div>");
                                }
                            } else {
                                $(temp1).append('<div class="status incorrect"></div>');
                            }
                            $(this).next().slideDown(300);
                        } else {
                            $(temp1).append('<div class="status correct"></div>');
                        }
                    }
                });
        });
        if (!$rootScope.summary) {
            $(".current .gapFill").each(function (e) {
                $rootScope.uData[$rootScope.d.curr]["answer"][e] = "";
                $rootScope.uData[$rootScope.d.curr]["answer"][e] = $(this).val();
            });
            uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
        }
        if ($(".current .linkFeedback").find("li").length > 0) {
            if (!$rootScope.summary) {
                $(".current .linkFeedback").slideDown(300);
            } else {
                $(".current .linkFeedback").show();
            }
        }
        $(".skip,.checkAns").hide();
        $(".next,.endTest").show();
    };

    $rootScope.userStoredAnswer = function (arr) {
        arr = arr.answer;
        $(".current .gapFill").each(function (e) {
            $(this).text(arr[e]);
        });
        angular.element(".current .checkAns").triggerHandler("click");
        $(".template").removeClass("current").removeClass("template");
    };
    $timeout(function () {
        if ($(".qTxt:first").find(".ques").not(".empty").length == 1) {
            var maxW = getMaxW($(".ques"));
        }
        if ($rootScope.d["exercise"].hasOwnProperty("group")) {
            $(".current .qTxt ").each(function (e) {
                $(this).html($rootScope.d["exercise"]["question"][e]["group"]);
            });
        }
        var w = 0,
            cw,
            temp;
        var temp = document.createElement("div");
        $(temp).appendTo(".mshell");
        $(temp).css({
            top: "-9999px",
            left: "-999px",
            padding: "0px 3px 0px 3px",
            position: "absolute",
        });
        var arr = $rootScope.d["exercise"]["question"];
        $.each(arr, function (qindex, value) {
            // if (typeof arr[qindex]["answer"] != "undefined") {
            $.each(arr[qindex]["answer"], function (ansInd, value1) {
                if (typeof arr[qindex]["answer"][ansInd] == "object") {
                    $.each(arr[qindex]["answer"][ansInd], function (ans, ansvalue) {
                        $(temp).html(ansvalue);
                        cw = $(temp).outerWidth();
                        if (cw > w) {
                            w = Math.round(cw);
                        }
                    });
                } else {
                    $(temp).html(value1);
                    cw = $(temp).outerWidth();
                    if (cw > w) {
                        w = Math.round(cw);
                    }
                }
            });
            // }
        });
        $(".current .gapFill").css("width", w + 20 + "px");

        $(".gapFill")
            .off("keyup")
            .on("keyup", function () {
                var Cflag = false;
                $(".gapFill").each(function () {
                    if ($(this).val() == "") {
                        Cflag = true;
                        return false;
                    }
                });
                if (!Cflag) {
                    $(".checkAns").show();
                } else {
                    $(".checkAns").hide();
                }
            });
        updateAtag();
        if ($rootScope.d["exercise"].hasOwnProperty("sample")) {
            var ans;
            $(".current .correctionSample_eg")
                .find(".gapFill")
                .each(function (e) {
                    $(this).attr("disabled", true);
                    ans = $rootScope.d["exercise"]["sample"]["answer"];
                    $(this).html(ans[e]);
                });
        }
        if ($(".current .questionSet").length == 1) {
            $(".current .qTxt").addClass("onlyElem");
        }
        $(".gapFill").autogrow({ vertical: true, horizontal: false, flickering: false });
    });

    $scope.setW = function () {
        $timeout(function () {
            var max = 0;
            angular.forEach(angular.element(".current .ques"), function (value, key) {
                var a = angular.element(value).width();
                a = Math.round(a) + 5;
                if (a > max) {
                    max = a;
                }
            });
            if (max > 80) {
                $(".current .ques")
                    .not(".empty")
                    .css("width", max + "px");
            }
            $compile(angular.element(".current .ques"))($scope);
        });
    };
});
///////////////////////////////////////////end gapfill////////////////////////////////////////////

//////////////////////////////////multi_touch_button////////////////////////////////////////////
angular.module("myApp.multi_touch_button", []).controller("multi_touch_button", function ($rootScope, $compile, $scope, $filter, $timeout) {
    $(".template").addClass("current");
    $timeout(function () {
        $scope.loadTemplate();
        updateAtag();
        $(".checkAns").hide();
    });
    var max = 0;
    $scope.setW = function () {
        angular.forEach(angular.element(".current .userInput"), function (value, key) {
            var a = angular.element(value).width();
            a = Math.round(a) + 30;
            if (a > max) {
                max = a;
            }
        });
        if (max > 80) {
            $(".current .userInput").css("width", max + "px");
        }
        $compile(angular.element(".current .userInput"))($scope);
    };
    $scope.getText = function (obj) {
        var temp = obj["text"];
        var part = "";
        angular.forEach(temp, function (value, key) {
            part += "<div class='ques'>" + value + "</div>";
            if (typeof obj["option"][key] != "undefined") {
                angular.forEach(obj["option"][key], function (valuein, keyin) {
                    part += "<div class='userInput' ng-click='userSelect($event)'  data-group='" + key + "'>" + valuein + "</div>";
                });
            }
        });
        return part;
    };
    $scope.userSelect = function (event) {
        var curQues = $(event.target).parent().attr("data-ques");
        var curGrp = $(event.target).attr("data-group");
        if ($(".current .qTxt[data-ques=" + curQues + "]").find(".userInput[data-group=" + curGrp + "]").length > 1) {
            $(".current .qTxt[data-ques=" + curQues + "]")
                .find(".userInput[data-group=" + curGrp + "]")
                .not(event.target)
                .removeClass("selected");
            $(event.target).addClass("selected");
        } else {
            $(event.target).toggleClass("selected");
        }
        if ($(".current .qTxt .selected").length >= $(".current .qTxt").length) {
            $(".checkAns").show();
        } else {
            $(".checkAns").hide();
        }
    };
    $rootScope.userStoredAnswer = function (arr) {
        $(".current .userInput").each(function (i) {
            if (arr.answer[i] == $(this).text()) {
                $(this).addClass("selected");
            }
        });
        angular.element(".current .checkAns").triggerHandler("click");
        $(".template").removeClass("current").removeClass("template");
    };
    $scope.checkAnswer = function (e, _val) {
        $scope.disable = true;
        var curGrp, userAns, _this;
        if (!$rootScope.summary) {
            $rootScope.uData[$rootScope.d.curr] = {};
            $rootScope.uData[$rootScope.d.curr].template = $rootScope.d.exercise["template"];
            $rootScope.uData[$rootScope.d.curr]["answer"] = [];
        }
        var fb;
        $(".current .qTxt").each(function (quesInd) {
            _this = $(this);
            $(this)
                .find(".selected")
                .each(function (e) {
                    userAns = $(this).text();
                    curGrp = $(this).attr("data-group");
                    var ans = $rootScope.d["exercise"]["question"][quesInd]["answer"]["right"];
                    var rans = ans[curGrp];
                    if ($.inArray(userAns, rans) == -1) {
                        $(this).after('<div class="status incorrect"></div>');
                        _this.find(".userInput").each(function (e) {
                            userAns = $(this).text();
                            curGrp = $(this).attr("data-group");
                            userAns = userAns.toLowerCase().trim();
                            var ans = $rootScope.d["exercise"]["question"][quesInd]["answer"]["right"];
                            var rans = ans[curGrp][0].toLowerCase().trim();
                            if (userAns == rans) {
                                $(this).not(".selected").addClass("feedback");
                            }
                        });
                    } else {
                        $(this).after('<div class="status correct"></div>');
                    }
                    fb = $rootScope.d["exercise"]["question"][quesInd]["answer"];
                    _this.find(".ifb").remove();
                    if (fb.hasOwnProperty("feedback")) {
                        _this.append('<div class="feedback ifb">' + fb.feedback[0]["desc"] + "</div>");
                    }
                });
        });
        if ($(".current .linkFeedback").find("li").length > 0) {
            if (!$rootScope.summary) {
                $(".current .linkFeedback").slideDown(300);
            } else {
                $(".current .linkFeedback").show();
            }
        }
        if (!$rootScope.summary) {
            $(".current .userInput").each(function (e) {
                $rootScope.uData[$rootScope.d.curr]["answer"][e] = "";
                if ($(this).hasClass("selected")) {
                    $rootScope.uData[$rootScope.d.curr]["answer"][e] = $(this).text();
                }
            });
            uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
        }
        $(".skip,.checkAns").hide();
        $(".endTest").show();
    };
});
///////////////////////////////////////////end multi_touch_button////////////////////////////////////////////

////////////////////////////////////////// start single_touch_button////////////////////////////////////////

angular.module("myApp.single_touch_button", []).controller("single_touch_button", function ($rootScope, $compile, $scope, $filter, $timeout) {
    $(".template").addClass("current");
    $timeout(function () {
        $scope.loadTemplate();
        updateAtag();
        $(".checkAns").hide();
        if ($(".current .qTxt").length == 1) {
            $(".current .qTxt").addClass("onlyElem");
        }
        $(".current .qTxt").last().css("margin-bottom", "0px");
        $(".current .questionSet").last().css("margin-bottom", "0px");
        $(".current .qTxt ").each(function (i) {
            var txt = $(this).find(".ques").last().text();
            txt = txt.trim();
            if (txt == "." || txt.length == 1) {
                var prev = $(this).find(".ques").last().prev();
                var temp = document.createElement("div");
                $(this).append(temp);
                $(temp).append(prev);
                $(temp).append($(this).find(".ques").last());
                $(temp).css("display", "inline-block");
            }
        });
    });
    var max = 0;
    $scope.setW = function () {
        angular.forEach(angular.element(".current .userInput"), function (value, key) {
            var a = angular.element(value).width();
            a = Math.round(a) + 30;
            if (a > max) {
                max = a;
            }
        });
        if (max > 80) {
            $(".current .userInput").css("width", max + "px");
        }
        $compile(angular.element(".current .userInput"))($scope);
    };

    $scope.userSelect = function (event) {
        var curQues = $(event.target).closest(".qTxt").attr("data-ques");
        var curGrp = $(event.target).attr("data-group");
        var items = [];
        $(".current .qTxt[data-ques=" + curQues + "]")
            .find(".userInput[data-group=" + curGrp + "]")
            .not(event.target)
            .removeClass("selected");
        $(event.target).addClass("selected");
        $(".current .qTxt").each(function (i) {
            items[i] = [];
            $(this)
                .find(".userInput")
                .each(function (e) {
                    items[i][$(this).attr("data-group")] = true;
                });
        });
        var flag = false;
        $.each(items, function (index, value) {
            $.each(value, function (index1, value1) {
                if (
                    !$(".current .qTxt[data-ques=" + index + "]")
                        .find(".userInput[data-group=" + index1 + "]")
                        .hasClass("selected")
                ) {
                    flag = true;
                    return false;
                }
            });
        });
        if (!flag) {
            $(".checkAns").show();
        }
    };
    $rootScope.userStoredAnswer = function (arr) {
        $(".current .userInput").each(function (i) {
            if (arr.answer[i] == $(this).text()) {
                $(this).addClass("selected");
            }
        });
        angular.element(".current .checkAns").triggerHandler("click");
        $(".template").removeClass("current").removeClass("template");
    };
    $scope.checkAnswer = function (e, _val) {
        $scope.disable = true;
        var curGrp, userAns, _this;
        if (!$rootScope.summary) {
            $rootScope.uData[$rootScope.d.curr] = {};
            $rootScope.uData[$rootScope.d.curr].template = $rootScope.d.exercise["template"];
            $rootScope.uData[$rootScope.d.curr]["answer"] = [];
        }
        var cAns, cgroup;
        $(".current .status").remove();
        $(".current .qTxt").each(function (quesInd) {
            _this = $(this);
            $(this)
                .find(".selected")
                .each(function (e) {
                    userAns = $(this).text();
                    cgroup = $(this).attr("data-group");
                    cAns = $rootScope.d["exercise"]["question"][quesInd]["answer"][cgroup];
                    var temp = document.createElement("div");
                    $(this).after(temp);
                    $(temp).css("display", "inline-block");
                    $(temp).append($(this));
                    if (userAns != cAns) {
                        $(temp).append('<div class="status incorrect"></div>');
                        if (!$rootScope.d.exercise.hasOwnProperty("hideRight")) {
                            _this.find(".userInput").each(function (e) {
                                userAns = $(this).text();
                                cgroup = $(this).attr("data-group");
                                cAns = $rootScope.d["exercise"]["question"][quesInd]["answer"][cgroup];
                                if (userAns == cAns) {
                                    $(this).not(".selected").addClass("feedback");
                                }
                            });
                        }
                    } else {
                        $(temp).append('<div class="status correct"></div>');
                    }
                });
        });
        if ($(".current .linkFeedback").find("li").length > 0) {
            if (!$rootScope.summary) {
                $(".current .linkFeedback").slideDown(300);
            } else {
                $(".current .linkFeedback").show();
            }
        }
        if (!$rootScope.summary) {
            $(".current .userInput").each(function (e) {
                $rootScope.uData[$rootScope.d.curr]["answer"][e] = "";
                if ($(this).hasClass("selected")) {
                    $rootScope.uData[$rootScope.d.curr]["answer"][e] = $(this).text();
                }
            });
            uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
        }
        $(".skip,.checkAns").hide();
        $(".endTest").show();
    };
});
////////////////////////////////////////// end single_touch_button////////////////////////////////////////

////////////////////////////////////////////start Correcttion ///////////////////////////////////

angular.module("myApp.correctionSent", []).controller("correctionSent", function ($rootScope, $scope, $filter, $timeout) {
    $(".template").addClass("current");
    $timeout(function () {
        $scope.loadTemplate();
        updateAtag();
        if ($(".current .correct_ques").length == 1) {
            $(".current .correct_ques").addClass("onlyElem");
        }
        $scope.keypress = function (e) {
            var display = false;
            $(".current textarea").each(function () {
                if ($(this).val() == "") {
                    display = true;
                }
            });
            if (!display) {
                $(".checkAns").show();
            } else {
                $(".checkAns").hide();
            }
        };
        $timeout(function () {
            $(".userInput").autogrow({ vertical: true, horizontal: false, flickering: false });
        }, 100);
    });
    $scope.checkAnswer = function (e, _val) {
        if (!$rootScope.summary) {
            $rootScope.uData[$rootScope.d.curr] = {};
            $rootScope.uData[$rootScope.d.curr].template = $rootScope.d.exercise["template"];
            $rootScope.uData[$rootScope.d.curr]["answer"] = [];
        }
        $scope.disable = true;
        var userAns, ans, correct_flag, fb, hei;
        $(".current .feedback").remove();
        $(".current .userInput").each(function (quesInd) {
            userAns = $(this).val();
            hei = $(this).height();
            if (userAns != "") {
                if (!$rootScope.summary) {
                    $rootScope.uData[$rootScope.d.curr]["answer"][quesInd] = $(this).val();
                }
                ans = $rootScope.d["exercise"]["question"][quesInd]["answer"]["right"];
                if ($rootScope.d.exercise.hasOwnProperty("ignorePunctuate")) {
                    correct_flag = checkAns(userAns, ans, true);
                } else {
                    correct_flag = checkAns(userAns, ans);
                }
                if (!correct_flag) {
                    var wid = $(".current .feedback").width();
                    if (!$rootScope.d.exercise.hasOwnProperty("hideRight")) {
                        if (typeof ans == "object") {
                            $(this).after('<div class="feedback">' + ans[0] + " </div>");
                        } else {
                            $(this).after('<div class="feedback">' + ans + " </div>");
                        }
                    }
                    $(this).after('<div class="status incorrect" style="height:' + hei + 'px"></div>');
                } else {
                    $(this).after('<div class="status correct"style="height:' + hei + 'px"></div>');
                }
                fb = $rootScope.d["exercise"]["question"][quesInd]["answer"];
                if (fb.hasOwnProperty("feedback")) {
                    $(this)
                        .parent()
                        .append('<div class="feedback">' + fb.feedback[0]["desc"] + "</div>");
                }
            }
        });
        var max = 0;
        angular.forEach(angular.element(".current .feedback"), function (value, key) {
            var a = angular.element(value).width();
            a = Math.round(a);
            if (a > max) {
                max = a;
            }
        });
        //$('.current .feedback').css("width", "100%");
        //$('.current .feedback').css("max-width", (max + 12) + "px");
        $(".current .feedback").css("display", "inline-block");
        if ($(".current .linkFeedback").find("li").length > 0) {
            if (!$rootScope.summary) {
                $(".current .linkFeedback").slideDown(300);
            } else {
                $(".current .linkFeedback").show();
            }
        }
        if (!$rootScope.summary) {
            uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
        }
        $(".current .userInput").attr("contenteditable", "false");
        $(".skip,.checkAns").hide();
        $(".next,.endTest").show();
    };

    $rootScope.userStoredAnswer = function (arr) {
        $(".current .userInput").each(function (i) {
            $(this).text(arr["answer"][i]);
        });
        angular.element(".current .checkAns").triggerHandler("click");
        $(".template").removeClass("current").removeClass("template");
    };
});
/////////////////////////////////////////////////////end Correction ////////////////////////////////////////////////////

////////////////////////////////////////////////////Start Free text entry//////////////////////////////////////////////

angular.module("myApp.freeText", []).controller("freeText", function ($rootScope, $scope, $filter, $timeout) {
    $(".template").addClass("freeText").addClass("current");
    $timeout(function () {
        updateAtag();
        $scope.loadTemplate();
        if ($(".current .ques_group:not(:empty)").length == 1) {
            $(".current .ques_group").addClass("onlyElem");
        }
        $scope.keypress = function (e) {
            var display = false;
            $(".current textarea").each(function () {
                if ($(this).val() == "") {
                    display = true;
                }
            });
            if (!display) {
                $(".checkAns").show();
            } else {
                $(".checkAns").hide();
            }
        };
        $(".freeText_entry").autogrow({ vertical: true, horizontal: false, flickering: false });
    });
    var max = 0;
    $scope.setW = function () {
        $timeout(function () {
            angular.forEach(angular.element(".ques_group"), function (value, key) {
                var a = angular.element(value).width();
                a = Math.round(a) + 18;
                if (a > max) {
                    max = a;
                }
            });
        });
    };

    $scope.checkAnswer = function (e, _val) {
        $(".current .feedback").remove();
        $scope.disable = true;
        if (!$rootScope.summary) {
            $rootScope.uData[$rootScope.d.curr] = {};
            $rootScope.uData[$rootScope.d.curr].template = $rootScope.d.exercise["template"];
            $rootScope.uData[$rootScope.d.curr]["answer"] = [];
            $rootScope.uData[$rootScope.d.curr]["answer"][0] = $(".freeText_entry").val();
        }
        if ($rootScope.d["exercise"].hasOwnProperty("answer")) {
            $(".current .questions").append('<div class="feedback">' + $rootScope.d["exercise"]["answer"] + " </div>");
            $(".current .questions .feedback").show();
        }
        $(".current .freeText_entry").removeAttr("contenteditable");
        if ($(".current .linkFeedback").find("li").length > 0) {
            if (!$rootScope.summary) {
                $(".current .linkFeedback").slideDown(300);
            } else {
                $(".current .linkFeedback").show();
            }
        }
        if (!$rootScope.summary) {
            uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
        }
        $(".template").removeClass("current").removeClass("template");
        $(".skip,.checkAns").hide();
        $(".endTest").show();
    };
    $rootScope.userStoredAnswer = function (arr) {
        if (arr.template == "freetext") {
            $(".current .freeText_entry").text(arr.answer[0]);
            $(".current .freeText_entry").autogrow({ vertical: true, horizontal: false, flickering: false });
            angular.element(".current .checkAns").triggerHandler("click");
            $(".template").removeClass("current").removeClass("template");
            $(".feedback").css("opacity", 1);
        }
    };
});
//////////////////////////////////////////////////End of Free text Entry/////////////////////////////////////////////////////

//////////////////////////////////////////////////Start Multi radio control/////////////////////////////////////////////////////

angular.module("myApp.mRadioCtrl", []).controller("mRadioCtrl", function ($scope, $rootScope, $filter, $timeout) {
    $(".template").addClass("mRadioCtrl").addClass("current");
    $scope.disable = false;
    var arr = [];
    $scope.Rclean = function (txt) {
        txt = txt.replace(/<(?:.|\n)*?>/gm, "");
        return txt.replace(/['/']/g, "");
    };
    $scope.radioClick = function (e, _val) {
        //$('.checkAns').show();
        var el = $(e.currentTarget);
        el.parent().find(".selected").removeClass("selected");
        el.addClass("selected");
        $scope.ans = el.find(".radioTxt").text();
        el.parent().attr("data-ans", $scope.ans);
        if ($(".current .radioC").length == $(".current .radioBtn.selected").length) {
            $(".checkAns").show();
        }
    };
    $(".checkAns").hide();
    $scope.checkAns = function () {
        $(".current .fb").remove();
        $(".current .feedback").remove();
        $scope.disable = true;
        var q = $rootScope.d.exercise.question;
        var right, uAns;
        $(".current .questionSet .radioC").each(function (i) {
            if ($(this).attr("data-ans")) {
                right = q[i].answer.right;
                right = right.replace(/['/']/g, "");
                if ($(this).attr("data-ans") == q[i].answer.right[0] || $(this).attr("data-ans") == q[i].answer.right) {
                    $(this).addClass("right");
                    $(this).find(".selected").append('<div class="status correct"></div>');
                } else {
                    $(this).addClass("wrong");
                    $(this).find(".selected").append('<div class="status incorrect"></div>');
                    if (!$rootScope.d.exercise.hasOwnProperty("hideRight")) {
                        $(this)
                            .find(".radioBtn")
                            .find(".patch.p_" + right + "")
                            .css("background-color", "#87b03f");
                    }
                }
                if (q[i].answer.hasOwnProperty("feedback")) {
                    if (q[i].answer.feedback[0]["desc"].indexOf("should_be") != -1) {
                        if ($(this).hasClass("right")) {
                            $(this).after('<div class="fb shud_be" style="">' + q[i].answer.feedback[0]["desc"] + "</div>");
                        } else {
                            $(this).after('<div class="fb">' + q[i].answer.feedback[0]["desc"] + "</div>");
                        }
                    } else {
                        if ($(this).hasClass("right")) {
                            $(this).after('<div class="feedback" style="background-color:#D0D0D0;">' + q[i].answer.feedback[0]["desc"] + "</div>");
                        } else {
                            $(this).after('<div class="feedback">' + q[i].answer.feedback[0]["desc"] + "</div>");
                        }
                    }
                    if (!$rootScope.summary) {
                        $(this).next().slideDown(300);
                    } else {
                        $(this).next().show();
                    }
                }
                if ($(".current .linkFeedback").find("li").length > 0) {
                    if (!$rootScope.summary) {
                        $(".current .linkFeedback").slideDown(300);
                    } else {
                        $(".current .linkFeedback").show();
                    }
                }
            }
        });
        $(".current .radioBtn").each(function (i) {
            if ($(this).hasClass("selected")) {
                arr.push(i);
            }
        });
        if (!$rootScope.summary) {
            $rootScope.uData[$rootScope.d.curr] = arr;
            uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
        }
        $(".skip,.checkAns").hide();
        $(".next,.endTest").show();
        $(".template").removeClass("current").removeClass("template");
    };
    $timeout(function () {
        updateAtag();
        $scope.loadTemplate();
        $(".current .input_text:first").css("margin-left", "26px");
        $(".current .input_text:first").css("margin-top", "0px");
        $(".current .rwDiv").before($(".current .input_text:first"));
        $(".current .radioC").last().css("margin-bottom", "0px");
        if ($('.current .qTxt[disabled != "disabled"]').length == 1) {
            $(".current .qTxt").addClass("onlyElem");
        }
    }, 0);
    $rootScope.userStoredAnswer = function (_arr) {
        for (var i in _arr) {
            $(".current .radioBtn").eq(_arr[i]).trigger("click");
        }

        angular.element(".current .checkAns").triggerHandler("click");
        $(".template").removeClass("current").removeClass("template");
    };
});
angular.module("myApp.single_radio", []).controller("single_radio", function ($scope, $rootScope, $filter, $timeout) {
    $(".template").addClass("single_radio").addClass("current");
    $scope.disable = false;
    var arr = [];
    $scope.radioClick = function (e, _val) {
        var el = $(e.currentTarget);
        el.parent().find(".selected").removeClass("selected");
        el.addClass("selected");
        $scope.ans = el.find(".radioTxt").text();
        el.parent().attr("data-ans", $scope.ans);
        if ($(".current .radioC").length == $(".current .radioBtn.selected").length) {
            checkAnsF = true;
            $(".checkAns").show();
        }
    };
    $(".checkAns").hide();
    var checkAnsF = false;
    $scope.checkAns = function () {
        $(".current .feedback").remove();
        if (checkAnsF) {
            $scope.disable = true;
            var radioC = $(".current .radioC");
            $(".current .status").remove();
            radioC.each(function (e) {
                var c_grp = $(this).attr("data-group");
                var _this = $(this);
                var q = $rootScope.d.exercise.question[c_grp];
                checkAnsF = false;
                var cFlag = false;

                if (typeof q.answer == "object") {
                    if (q.answer.indexOf(_this.attr("data-ans")) != -1) {
                        cFlag = true;
                    }
                } else {
                    if (_this.attr("data-ans") == q.answer) {
                        cFlag = true;
                    }
                }
                if (cFlag) {
                    _this.addClass("right");
                    _this.find(".selected").append('<div class="status correct"></div>');
                } else {
                    _this.addClass("wrong");
                    _this.find(".selected").append('<div class="status incorrect"></div>');
                    if (!$rootScope.d.exercise.hasOwnProperty("hideRight")) {
                        _this
                            .find(".radioBtn")
                            .find(".patch.p_" + q.rIndex + "")
                            .css("background-color", "#87b03f");
                    }
                    if (q.answer.hasOwnProperty("feedback")) {
                        _this.after('<div class="feedback">' + q.answer.feedback.should_be + "</div>");
                        if (!$rootScope.summary) {
                            _this.next().slideDown(300);
                        } else {
                            _this.next().show();
                        }
                    }
                }
            });
            if ($(".current .linkFeedback").find("li").length > 0) {
                if (!$rootScope.summary) {
                    $(".current .linkFeedback").slideDown(300);
                } else {
                    $(".current .linkFeedback").show();
                }
            }
        }
        $(".current .radioBtn").each(function (i) {
            if ($(this).hasClass("selected")) {
                arr.push(i);
            }
        });
        if (!$rootScope.summary) {
            $rootScope.uData[$rootScope.d.curr] = arr;
            uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
        }
        $(".skip,.checkAns").hide();
        $(".next,.endTest").show();
    };
    $timeout(function () {
        updateAtag();
        $scope.loadTemplate();
    }, 0);
    $rootScope.userStoredAnswer = function (_arr) {
        for (var i in _arr) {
            $(".current .radioBtn").eq(_arr[i]).trigger("click");
        }
        angular.element(".current .checkAns").triggerHandler("click");
        $(".template").removeClass("current").removeClass("template");
    };
});
angular.module("myApp.mRadioTextCtrl", []).controller("mRadioTextCtrl", function ($scope, $rootScope, $filter, $timeout, $compile) {
    var arr = [];
    var txt_arr = [];
    $(".template").addClass("mRadioTextCtrl").addClass("current");
    $scope.class = "mRadioTextCtrl";
    $scope.disable = false;
    var maxW = getInputW($rootScope.d.exercise.question);
    $scope.radioClick = function (e, _val) {
        var el = $(e.currentTarget);
        el.parent().find(".selected").removeClass("selected");
        el.addClass("selected");
        $scope.ans = el.find(".radioTxt").text();
        el.parent().attr("data-ans", $scope.ans);
        if ($(".current .radioC").length == $(".current .radioBtn.selected").length) {
            checkAnsF = true;
            $(".current .checkAns").show();
        }
    };
    $(".current .checkAns").hide();
    $scope.keypress = function (e) {
        var display = false;
        $(".current .questionSet .textEntry").each(function () {
            if ($(this).val() == "") {
                display = true;
            }
        });
        if (!display) {
            $(".checkAns").show();
        } else {
            $(".checkAns").hide();
        }
    };
    var checkAnsC = 0,
        clicks = 0;
    $scope.checkAns = function () {
        //
        $(".checkAns").hide();
        if (checkAnsC == 0) {
            $(".current .feedback1").remove();
            checkAnsC++;
            var q = $rootScope.d.exercise.question;
            var r_Ans;
            $(".current .radioC").each(function (i) {
                if (typeof q[i].answer == "object" && typeof q[i].answer[0] != "undefined") {
                    r_Ans = q[i].answer[0].right[0];
                } else {
                    r_Ans = q[i].answer.right;
                }

                if ($(this).attr("data-ans") == r_Ans || ($(this).attr("data-ans") == "W" && r_Ans != "Right" && r_Ans != "R")) {
                    $(this).addClass("right");
                    $(this).find(".selected").append('<div class="status correct"></div>');
                } else {
                    if ($(this).attr("data-ans")) {
                        $(this).addClass("wrong");
                        $(this).find(".selected").append('<div class="status incorrect"></div>');
                    }
                    // if (!$rootScope.d.exercise.hasOwnProperty("hideRight")) {

                    $(this)
                        .find(".radioBtn")
                        .find(".radioTxt:contains(" + r_Ans + ")")
                        .prev()
                        .prev()
                        .css("background-color", "#87b03f");

                    //  }
                    if (q[i].answer.hasOwnProperty("feedback")) {
                        if (typeof q[i].answer[1] == "undefined") {
                            $(this).after('<div class="feedback feedback1" style="margin-top:0px">' + q[i].answer.feedback[0].desc + "</div>");
                        }

                        $(this).next().show();
                    }
                }

                if ((r_Ans == "Wrong" || r_Ans == "W" || r_Ans == "N" || r_Ans == "Y") && typeof q[i].answer[1] != "undefined") {
                    if (maxW < $(".questionSet").width()) {
                        var temp = $compile(
                            '<div class="radioTxtEntry"><textarea rows="1" class="textEntry userInput form-control" ng-keyup="keypress($event)" style="max-width:' +
                                maxW +
                                'px"  autocorrect="off" autocapitalize="none" spellcheck="false"></textarea></div>'
                        )($scope);
                    } else {
                        var temp = $compile(
                            '<div class="radioTxtEntry"><textarea rows="1" class="textEntry userInput form-control" ng-keyup="keypress($event)"   autocorrect="off" autocapitalize="none" spellcheck="false"></textarea></div>'
                        )($scope);
                    }
                    $(this).after(temp);
                }
            });
            $(".textEntry").autogrow({ vertical: true, horizontal: false, flickering: false });
            angular.element(".current .radioBtn").unbind();
        } else {
            $(".current .feedback2").remove();
            clicks = 1;
            var q = $rootScope.d.exercise.question;
            $scope.disable = true;
            var correct_flag, userAns, ans;
            $(".current .questionSet").each(function (i) {
                if (typeof q[i].answer == "object" && typeof q[i].answer[0] != "undefined") {
                    r_Ans = q[i].answer[0].right[0];
                } else {
                    r_Ans = q[i].answer.right;
                }
                if (
                    (clean(r_Ans) == "wrong" || clean(r_Ans) == "w" || clean(r_Ans) == "n" || clean(r_Ans) == "y") &&
                    typeof q[i].answer[1] != "undefined"
                ) {
                    userAns = $(this).find(".textEntry").val();
                    ans = q[i].answer[1].right;
                    txt_arr.push(userAns);
                    if ($rootScope.d.exercise.hasOwnProperty("ignorePunctuate")) {
                        correct_flag = checkAns(userAns, ans, true);
                    } else {
                        correct_flag = checkAns(userAns, ans);
                    }
                    if (correct_flag) {
                        $(this).addClass("right");
                        $(this).find(".textEntry").after('<div class="status newStatus correct"></div>');
                    } else {
                        $(this).addClass("wrong");
                        $(this).find(".textEntry").after('<div class="status newStatus incorrect"></div>');
                        if (!$rootScope.d.exercise.hasOwnProperty("hideRight")) {
                            if (typeof ans == "object") {
                                $(this)
                                    .find(".textEntry")
                                    .parent()
                                    .append('<div class="feedback feedback2">' + q[i].answer[1].right[0] + "</div>");
                            } else {
                                $(this)
                                    .find(".textEntry")
                                    .parent()
                                    .append('<div class="feedback feedback2">' + q[i].answer[1].right + "</div>");
                            }
                        }
                    }
                    if (q[i].answer[1].hasOwnProperty("feedback")) {
                        $(this)
                            .find(".textEntry")
                            .parent()
                            .append('<div class="feedback feedback2">' + q[i].answer[1].feedback[0].desc + "</div>");
                    }
                }
            });
            if ($(".current .linkFeedback").find("li").length > 0) {
                if (!$rootScope.summary) {
                    $(".current .linkFeedback").slideDown(300);
                } else {
                    $(".current .linkFeedback").show();
                }
            }
            $(".current .feedback").fadeIn(300);
            $(".skip,.checkAns").hide();
            $(".next,.endTest").show();
        }
        $(".current .radioBtn").each(function (i) {
            if ($(this).hasClass("selected")) {
                arr.push(i);
            }
        });
        if (!$rootScope.summary) {
            $rootScope.uData[$rootScope.d.curr] = { arr: arr, data: clicks, txt_arr: txt_arr };
            uploadUserData($rootScope.fIndex, $rootScope.fLevel, $rootScope.uData);
        }
    };
    $timeout(function () {
        updateAtag();
        $(".current .input_text:first").css("margin-left", "26px");
        $(".current .input_text:first").css("margin-top", "0px");
        $(".current .rwDiv").before($(".current .input_text:first"));
        if ($('.current .qTxt[disabled != "disabled"]').length == 1) {
            $(".current .questionSet").addClass("onlyElem");
            $(".current .qTxt").addClass("onlyElem");
        }
        $scope.loadTemplate();
    }, 0);
    $rootScope.userStoredAnswer = function (_arr) {
        for (var i in _arr.arr) {
            $(".current .radioBtn").eq(_arr.arr[i]).trigger("click");
        }

        angular.element(".current .checkAns").triggerHandler("click");
        if (_arr.data == 1) {
            checkAnsC++;
            $(".current .textEntry").autogrow({ vertical: true, horizontal: false, flickering: false });
            $(".current .questionSet")
                .find(".textEntry")
                .each(function (i) {
                    $(this).text(_arr.txt_arr[i]);
                });
            angular.element(".current .checkAns").triggerHandler("click");
        }
        $(".template").removeClass("current").removeClass("template");
    };
});
var shuffleArray = function (array) {
    var m = array.length,
        t,
        i;
    // While there remain elements to shuffle
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
};

var getMaxW = function (arr) {
    var w = 0;
    arr.each(function () {
        if (w < $(this).width()) {
            w = Math.round($(this).width()) + 1;
        }
    });
    arr.width(w);
};

var getInputW = function (arr) {
    var temp = document.createElement("div");
    $(temp).appendTo(".mshell");
    $(temp).css({
        position: "absolute",
        top: "-9999999px",
        left: "-9999999px",
        padding: "0px 3px 0px 3px",
        border: "1px solid rgba(162,162,162,0.9)",
    });
    var w = 0,
        cw;
    $.each(arr, function (index, value) {
        if (typeof arr[index]["answer"][1] != "undefined") {
            if (typeof arr[index]["answer"][1]["right"] == "object") {
                $.each(arr[index]["answer"][1]["right"], function (index1, value1) {
                    $(temp).html(value1);
                    cw = $(temp).outerWidth();
                    if (cw > w) {
                        w = Math.round(cw);
                    }
                });
            } else {
                $(temp).html(arr[index]["answer"][1]["right"]);
                cw = $(temp).outerWidth();
                if (cw > w) {
                    w = Math.round(cw);
                }
            }
        }
    });
    $(temp).remove();
    return w + 10;
};
var clean = function (str) {
    if (typeof str == "string") {
        str = str.replace(/[^\w\s]/gi, "");
        return str.trim().toLowerCase();
    }
};
var checkAns = function (uAns, rAns, exact) {
    var correct_flag = false;
    var rans;
    uAns = uAns.replace(/\s+/g, " ");
    uAns = uAns.trim();
    exact = typeof exact !== "undefined" ? exact : false;
    if (!exact) {
        uAns = clean(uAns);
    }

    if (typeof rAns == "object") {
        angular.forEach(rAns, function (value, key) {
            rans = rAns[key];
            if (!exact) {
                rans = clean(rAns[key]);
            }
            if (rans == uAns) {
                correct_flag = true;
            }
        });
    } else {
        if (!exact) {
            rAns = clean(rAns);
        }
        if (rAns == uAns) {
            correct_flag = true;
        }
    }
    return correct_flag;
};

var scrollToStart = function () {
    var targetOffset = $(".mshell").offset().top - 10;
    window.scrollTo({top: targetOffset, behavior: "smooth"});
};

var updateAtag = function () {
    var cLink = "./";
    $(".mshell .linkFeedback a").each(function () {
        var temp = $(this).attr("href");
        if (temp == "u7fcee40f68b1c46d.-bc2efee.153f5a50c54.404a") {
            temp = "language-terminology";
            cLink = "./";
        }
        $(this).attr("href", "#");
    });
};
var uploadUserData = function (index, level, data) {
    var fname = "data_" + index;
    if (!mFlag && main_data.length > 0) {
        //console.log("----------------Main Data-------------------");
        //console.log(main_data);
        //console.log("-----------------------------------");
        mFlag = true;
        var temp = {};
        temp.data = main_data;
        scormApi.uploadExcercisedata(temp);
    }
    if (typeof uAnswer[level] == "undefined") {
        uAnswer[level] = {};
    }
    uAnswer[level]["exerciseData"] = data;
    scormApi.updateUserData(fname, uAnswer, function () {});
};

$(document).ready(function () {
    scrollToStart();
});