app.directive("onFinishRender", function ($timeout) {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                scope.$evalAsync(attr.onFinishRender);
            }
        },
    };
})
    .directive("compile", function ($templateRequest, $compile) {
        return {
            scope: true,
            link: function (scope, element, attrs) {
                scope.name = attrs.foo;
                scope.show = false;
                $templateRequest("foo.html").then(function (html) {
                    element.append($compile(html)(scope));
                });
            },
        };
    })
    .directive("scroll", function ($window) {
        return function (scope, element, attrs) {
            angular.element($window).bind("scroll", function () {
                if (this.pageYOffset >= 230 && this.pageYOffset <= 2876) {
                    $(".tableTitle").addClass("tabFix");
                    $(".tableTitle").css("width", $(".lrnData").width() + "px");
                } else {
                    $(".tableTitle").removeClass("tabFix");
                    $(".tableTitle").css("width", "100%");
                }
            });
        };
    })
    .directive("ngSort", function ($window) {
        return {
            restrict: "EA",
            controller: function ($scope, $element, $attrs) {
                $($element).sortable({
                    containment: "parent",
                    cancel: ".disable-sort-item",
                    stop: function (e, ui) {
                        $(ui.item).removeClass("itemMoved").addClass("itemMoved");
                        if ($(".itemMoved").length == $(".quesWrap ").length) {
                            $(".checkAns").show();
                        }
                    },
                });
            },
        };
    });

angular
    .module("dnd", [])
    .service("dndService", function ($scope) {})
    .directive("ngDrag", function () {
        return {
            restrict: "EA",
            controller: function ($scope, $element, $attrs) {
                var clone_str = "original";
                $attrs.$observe("clone", function (value) {
                    if (value == "true") {
                        clone_str = "clone";
                    }
                    var offsetT;
                    $($element).draggable({
                        helper: clone_str,
                        start: function (event, ui) {
                            offsetT = $(ui)[0].helper.offset().top;
                        },
                        drag: function (event, ui) {
                            var elem_top = $(ui)[0].helper.offset().top;
                            var winHei = $(window).height();
                            var elemHei = $(ui)[0].helper.outerHeight();
                            var scrollT = $(window).scrollTop();

                            if (winHei - (elemHei + elem_top - scrollT) <= 10) {
                                $(window).scrollTop($(window).scrollTop() + 10);
                            } else if (elem_top - scrollT <= 10) {
                                clearTimeout(scrollUp);
                                var scrollUp = setTimeout(function () {
                                    $(window).scrollTop($(window).scrollTop() - 10);
                                }, 200);
                            }
                        },
                        revert: function (d) {
                            if (!d && $attrs.revert.toString() == "invalid") {
                                var that = this;
                                var i = $(that).attr("index");
                                $(this).fadeOut(300, function () {
                                    $(that).css({ top: "auto", left: "auto" });
                                    $(".dragC").each(function () {
                                        if ($(this).children().length == 0) {
                                            $(this).append($(that));
                                            return false;
                                        }
                                    });

                                    $(that).fadeIn(300);
                                    if ($(".current .q_row li").find(".drags").length == $(".current .q_row li").length) {
                                        $(".checkAns").show();
                                    } else {
                                        $(".checkAns").hide();
                                    }
                                });
                            }
                        },
                        zIndex: 2,
                        containment: $attrs.containment.toString(),
                    });
                });
            },
        };
    })
    .directive("ngDrop", function () {
        return {
            restrict: "EA",
            controller: function ($scope, $element, $attrs) {
                $($element).droppable({
                    drop: function (e, ui) {
                        if ($element.children().length == 0) {
                            if (typeof $attrs.append != "undefined" && $attrs.append.toString().trim() == "true") {
                                if ($(ui.draggable).attr("clone") == "true") {
                                    var _temp = $(ui.helper).clone();
                                    var wid = $(ui.helper).width() + 40;
                                    $element.append(_temp);
                                    _temp.removeClass("ui-draggable-dragging");
                                    _temp.attr("style", "");
                                    _temp.css({ top: "auto", left: "auto", "z-index": 3, width: wid + "px" });
                                    _temp.draggable({
                                        revert: function (d) {
                                            $(this).remove();
                                        },
                                    });
                                } else {
                                    $element.append($(ui.draggable));
                                    $(ui.draggable).css({ top: "auto", left: "auto", "z-index": 3 });
                                }
                            }
                        } else {
                            var i = $(ui.draggable).attr("index");
                            $(ui.draggable).fadeOut(300, function () {
                                $(ui.draggable).css({ top: "auto", left: "auto" });
                                $(".dragC").each(function () {
                                    if ($(this).children().length == 0) {
                                        $(this).append($(ui.draggable));
                                        return false;
                                    }
                                });

                                $(ui.draggable).fadeIn(300);
                            });
                        }
                        if ($(".current .q_row li").find(".drags").length == $(".current .q_row li").length) {
                            $(".checkAns").show();
                        } else {
                            $(".checkAns").hide();
                        }
                    },
                });
            },
        };
    });
