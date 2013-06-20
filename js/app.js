'use strict';
/* App Controllers */
var app = angular.module('app', []);

var board = app.factory('game', function() {
    return new Game("hard");
});

app.controller('GameCtrl', function GameCtrl($scope, game) {
    $scope.game = game;
});

app.directive('block', function() {
    return {
        restrict: 'E',
        scope: {
            icon: '='
        },
        link: function (scope, element, attrs) { // This isn't pretty but it works
            // console.log(scope.icon);
            if (scope.icon.name != null) {
                var paper = Raphael(element[0], 54, 54); // TODO: Make this scalable
                var rect = paper.path(icons[scope.icon.name][1])
                    .attr({fill: icons[scope.icon.name][0], stroke: "none"})
                    .transform("t14,14s1.6");
            }
        }
    }
});