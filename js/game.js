/* Model*/
'use strict';

function Icon(name, xpos, ypos) {
    this.name = name;
    this.x = xpos;
    this.y = ypos;
    this.selected = false;
}

Icon.prototype.select = function() {
    this.selected = !this.selected;
}

function Timer(max) {
    return max;
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
    this.timeleft = new Timer(this.settings.maxTime);
    this.level = difficulty;
    
    this.numSelect = 0;
    this.path = [];
    
    // Make a deck of icons and shuffle them
    this.deck = shuffle(makeDeck(icons, this.settings[difficulty]*2));
    this.remaining = this.deck.length / 2;
    this.grid = this.makegrid();
    
    this.select = function(icon) {
        
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
            this.first.select();
            this.first = undefined;
            this.last.select();
            this.last = undefined;
            this.numSelect = 0;
        }
        
        // Matching logic
        if (this.first && this.last) {
            //First off, are they the same icon
            if (this.first.name != this.last.name) {
                this.first.select();
                this.first = undefined;
                this.last.select();
                this.last = undefined;
                this.numSelect = 0;
            } else {
                this.path = getPath
            }
        }
    }
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

    // Model the board space into a 2D matrix
    for (r = 0; r < this.settings.row; r++) {
        if (r >= marginTopbottom && r < this.settings.row - marginTopbottom) {

            var oneRow = [];
            for (c = 0; c < this.settings.col; c++) {
                oneRow[c] = 1;
                if (c >= marginSide && c < this.settings.col - marginSide) {
                    var icon = new Icon(this.deck[i++], r, c);
                    oneRow[c] = icon // does this work?
                } 
                else {
                    oneRow[c] = 0;
                }
            }
            grid[r] = oneRow;
        }
        else {
            grid[r] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
    };
    return grid;
}

Game.prototype.removeIcon = function(x, y) {
}

function makeDeck(icons, repeats) {
    var deck = [];
    var titles = Object.keys(icons); // May run into compitability issues
    for (var i = repeats; i > 0; i--) {
        deck = deck.concat(titles);
    }
    return deck;
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