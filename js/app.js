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

function addCanvas()
{
    // Add a LI element
    var container = document.createElement('li');
    document.getElementById('wrapper').appendChild(container);
    // Get its dimensions
    var width = parseInt(getComputedStyle(container,"").getPropertyValue('width'));
    var height = parseInt(getComputedStyle(container,"").getPropertyValue('height'));
    // Create a RaphaelJS canvas inside it
    var paper = Raphael(container, width, height);
    // Draw!
    paper.rect(0, 0, width, height).attr('fill','black');
    paper.circle(width/2, height/2, Math.min(width,height)/4).attr('fill','white');
    // The end...
    return paper;
}

// get DOM element of containing cell
function drawSVG(container, iconpath) {
    // Get its dimensions
    var width = parseInt(getComputedStyle(container,"").getPropertyValue('width'));
    var height = parseInt(getComputedStyle(container,"").getPropertyValue('height'));
    var paper = Raphael(container, width, height);
    
    paper.path(iconpath).attr({fill: "#000", stroke: "none"});
    return paper;
}