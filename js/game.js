/* Model*/
'use strict';

// Model for each block on grid
function Icon(name, xpos, ypos, isEmpty) {
    this.name = name;
    this.x = xpos;
    this.y = ypos;
    this.isEmpty = isEmpty;
    this.selected = false;
}

Icon.prototype.select = function() {
    this.selected = !this.selected;
}

Icon.prototype.clear = function() {
    this.isEmpty = true;
    this.name = null;
    this.selected = false;
}

// Decrementing timer
// TODO: Fix this, not returning updates
function Timer(max) {
    var timeleft = max;

    var update = function () {
        if (timeleft > 0) {
            timeleft --;
        } else {
            clearInterval(update);
        }
    };
    setInterval(update, 1000);
    
    this.getTime = function() {
        return timeleft;
    }

}

Timer.prototype.addTime = function(moretime) {
    this.timeleft += moretime;
}

function Game(difficulty) {
    this.settings = { // TODO: Change this structure around
        "easy" : 2,
        "medium" : 3,
        "hard" : 4,
        "row" : 8,
        "col" : 10,
        "maxTime": 30
    },
    this.gameOver = false;
    var clock = new Timer(this.settings.maxTime);
    this.timer = clock.getTime();
    this.level = difficulty;
    this.score = 0;
    
    this.numSelect = 0;
    this.path = [];
    
    // Make a deck of icons and shuffle them
    this.deck = shuffle(makeDeck(icons, this.settings[difficulty]*2));
    this.remaining = this.deck.length / 2;
    this.grid = this.makegrid();
    
    this.select = function(icon) {
        // console.log(icon);
        if(icon.isEmpty) { 
            return false;
        };
        
        // Selection Logic
        if (icon == this.first || icon == this.last) {
            icon.select(); // Flip selection
            if (icon == this.first) { // Clear selection when clicking on icon that's already selected
                this.first = this.last;
                this.last = undefined;
                this.numSelect --;
            } else if (icon == this.last) {
                this.last = undefined;
                this.numSelect --;
            }
        } else if (!this.first) {
            icon.select();
            this.first = icon;
            this.numSelect ++;
        } else if (this.first && !this.last) {
            icon.select();
            this.last = icon;
            this.numSelect ++;
        } else {
            this.clear();
        }
        
        // Matching logic
        if (this.first && this.last) {
            //First off, are they the same icon
            if (this.first.name != this.last.name) {
                this.clear();
            } else {
                this.path = findPath([this.first.x, this.first.y], [this.last.x, this.last.y], this.grid, [], 2)
                // Found path, delete Icons
                if (this.path.length != 0) {
                    this.kill();
                    this.remaining --;
                    this.score += 100;
                    
                } else {
                    this.clear();
                }
            }
        }
    }
}

Game.prototype.kill = function() {
    this.first.clear();
    this.last.clear();
    // this.grid[this.first.x][this.first.y].clear();
    // this.grid[this.last.x][this.last.y].clear();
    
    this.grid[this.first.x][this.first.y] = 0;
    this.grid[this.last.x][this.last.y] = 0;
    
    this.first = undefined;
    this.last = undefined;
    
    this.numSelect = 0;
}

Game.prototype.clear = function() {
    this.first.select();
    this.first = undefined;
    this.last.select();
    this.last = undefined;
    this.numSelect = 0;
}

Game.prototype.makegrid = function() {

    var grid = [];
    var w, h, r, c;
    var i = 0;
    // makes it faster to type these:
    var row = this.settings.row;
    var col = this.settings.col;
    // easy -> 6 x 4 grid || medium -> 6 x 6 grid || hard -> 8 x 6 grid
    // todo: find an algorithm to make rectangles closest to sqrt of deck
    if (this.level == "easy") {
        w = 6;
        h = 4;
    } else if (this.level == "medium") {
        w = 6;
        h = 6;
    } else {
        w = 8;
        h = 6;
    };
    
    // Calculate gutters
    var marginTopbottom = (row - h) / 2;
    var marginSide = (col - w) / 2;

    // Model the board space into a 2D matrix with empty paddings around it
    for (r = 0; r < this.settings.row; r++) {
        var oneRow = [];
        if (r >= marginTopbottom && r < this.settings.row - marginTopbottom) {
            for (c = 0; c < this.settings.col; c++) {
                if (c >= marginSide && c < this.settings.col - marginSide) {
                    // Create new icon object at current position of grid
                    var icon = new Icon(this.deck[i++], r, c, false);  
                } 
                else {
                    // Create an empty object
                    var icon = new Icon(null, r, c, true);
                }
                oneRow[c] = icon;
            }
        }
        else {
            for (c = 0; c < this.settings.col; c++) {
                var icon = new Icon(null, r, c, true);
                oneRow[c] = icon;
            }
        }
        grid[r] = oneRow;
    };
    return grid;
}

function makeDeck(icons, repeats) {
    var deck = [];
    var titles = Object.keys(icons); // May run into compitability issues
    for (var i = repeats; i > 0; i--) {
        deck = deck.concat(titles);
    }
    return deck;
}

// returns a viable path, where cost is bound by the number of turns
// note that it tries to compute the path greedily, so it doesn't always return the most efficient path:
// checks which direction is the goal block
// try to move towards that direction in a straight line until it a) reaches it or b) is on the same plane as it c) hits another block, in which case it stops before the block and tries an alternate route
// every step of the way the algorithm computes a log of prioritized alternate paths in order to backtrack
// this is probably similar to an A* algorithm
function findPath(current, goal, grid, path, turns) {
    // console.log("current path: " + path);

    var stepsDown = goal[0] - current[0]; // delta row
    var stepsRight = goal[1] - current[1]; // delta column
    // var dirLeftRight = Math.abs(stepsLeft) > Math.abs(stepsDown); // Gives a good direction of where it is
    
    if (turns == 0) {
        return []; // No turns left
    } else if (stepsRight == 0 && stepsDown == 0) {
        // We are currently on the same grid
        return path;
    } else {  // search horizontally and vertically from the current spot, this is the least cost
        var direct = [];
        
        if (stepsDown == 0) { // we should search along the x axis
            if (stepsRight > 0) {
                direct = directPath("right", current, goal, grid);
            } else {
                direct = directPath("left", current, goal, grid);
            }
        }   
        if (stepsRight == 0) { // search up and down
            if (stepsDown > 0) {
                direct = directPath("down", current, goal, grid);
            } else {
                direct = directPath("up", current, goal, grid);
            }
        }
        
        if (direct.length == 0) { 
            return path;
            
        } else { // solve recursively
            
            if (path.length == 0) {
                path = direct;
            } else {
                path.concat(direct);
            }
            return findPath(direct[direct.length - 1], goal, grid, path, turns);
            
        }
    }
}

// returns true when there's a direct path in given direction
// can be solved recursively but I think it's faster this way
function directPath(dir, current, goal, grid) {
    var start = current;
    var pth = [];
    // console.log("going from: " + current + " to " + goal);
    while (start != goal) { 
        switch (dir) {
            case "left" :
                // move only when it's not hitting a wall && it's an empty spot, or our goal
                if (start[1] > 0 && grid[start[0]][start[1] - 1] == 0 || (start[1] - 1 == goal[1] && start[0] == goal[0])) {
                    start[1] --;
                    // console.log("captain, we're moving left");
                    pth.push(start); // add to current path
                } else {
                    return pth;
                }
                break;
            case "right" :
                if (start[1] <= grid[1].length && grid[start[0]][start[1] + 1] == 0 || (start[1] + 1 == goal[1] && start[0] == goal[0])) {
                    start[1] ++;
                    pth.push(start);
                } else {
                    return pth;
                }
                break;
            case "up" :
                if (start[0] > 0 && grid[start[0] - 1][start[0]] == 0 || (start[0] - 1 == goal[0] && start[1] == goal[1])) {
                    start[0] --;
                    // console.log("moving up");
                    pth.push(start); // add to current path
                } else {
                    return pth;
                }
                break;
            case "down" :
                if (start[0] < grid[0].length && grid[start[0] + 1][start[0]] == 0 || (start[0] + 1 == goal[0] && start[1] == goal[1])) {
                    start[0] ++;
                    // console.log("moving down");
                    pth.push(start); // add to current path
                } else {
                    return pth;
                }
                break;
            default :
                return;
        }
    }
    if (start == end) {
        pth.push(start);
        return pth;
    }
    
}

// Fisher–Yates Shuffle from http://bost.ocks.org/mike/shuffle/
function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = (Math.random() * counter--) | 0;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}