'use strict';
/* App Controllers */
var app = angular.module('app', []);

var board = app.factory('game', function() {
    return new Game("hard");
});

app.controller('GameCtrl', function GameCtrl($scope, game) {
    $scope.game = game;
});

app.directive('card', function() {
    return {
        restrict: 'E',
        scope: {
          icon: '='
        },
        link: function (scope, element, attrs) { // This isn't pretty but it works
            if (scope.icon.name != null) {
                console.log(element[0].outerHTML);
                var paper = Raphael(element[0], 75, 75); // TODO: Make this scalable
                var rect = paper.path(icons[scope.icon.name][1])
                    .attr({fill: icons[scope.icon.name][0], stroke: "none"})
                    .transform("t24,24s2");
            }
        }
    }
});