'use strict';

var app = angular.module('flip', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/index.html',
        controller: 'IndexController'
    });
});

function Tile(x, y, stateChar) {
    this.x = x || 0;
    this.y = y || 0;
    this.state = this.getStateFromChar(stateChar) || 'empty';// enum('empty', 'filled', 'negative') aka 0, 1, -1
    this.isSelected = false;
}
Tile.prototype.getStateFromChar = function (stateChar) {
    if (stateChar == 0) return 'empty';
    if (stateChar == 1) return 'filled';
    if (stateChar == -1) return 'negative';
}
Tile.prototype.fill = function () {
    this.state = 'filled';
}
Tile.prototype.select = function () {
    this.isSelected = true;
}
Tile.prototype.unselect = function () {
    this.isSelected = false;
}
Tile.prototype.isEmpty = function () {
    return this.state == 'empty';
}
Tile.prototype.isSelected = function () {
    return this.isSelected;
}
Tile.prototype.toString = function () {
    if (this.isSelected) return 'ʘ';
    if (this.state == 'empty') return '-';
    if (this.state == 'filled') return '•';
    if (this.state == 'negative') return 'X';
}

function Board(tileAbstraction) {
    if (!tileAbstraction) {
        throw new Error('asdf');
    }
    this.tiles = this.generateTiles(tileAbstraction);
    this.size = tileAbstraction.length;
}
Board.prototype.generateTiles = function (tiles) {
    var clonedTiles = new Array();
    for (var i = 0 ; i < tiles.length ; i++) {
        var row = tiles[i];
        for (var j = 0 ; j < row.length ; j++) {
            clonedTiles.push(new Tile(i, j, row[j]));
        }
    }
    return clonedTiles;
}
Board.prototype.getSelectedTiles = function () {
    var selectedTiles = [];
    for (var i = 0 ; i < this.tiles.length ; i++) {
        var tile = this.tiles[i];
        if (tile.isSelected) {
            selectedTiles.push(tile);
        }
    }
    return selectedTiles;
}
Board.prototype.findTile = function (x, y) {
    for (var i = 0 ; i < this.tiles.length ; i++) {
        var tile = this.tiles[i];
        if (tile.x === x && tile.y === y) {
            return tile;
        }
    }
}
Board.prototype.directionIsValid = function (direction) {
    return ['down', 'up', 'right', 'left'].indexOf(direction) < 0;
}
Board.prototype.getBoundsForTiles = function (tiles) {
    var xMinTile = tiles[0], xMaxTile = tiles[0], yMinTile = tiles[0], yMaxTile = tiles[0];
    for (var i = 0 ; i < tiles.length ; i++) {
        var current = tiles[i];
        xMinTile = current.x < xMinTile.x ? current : xMinTile;
        xMaxTile = current.x > xMaxTile.x ? current : xMaxTile;
        yMinTile = current.y < yMinTile.y ? current : yMinTile;
        yMaxTile = current.y > yMaxTile.y ? current : yMaxTile;
    }
    var bounds = {
        'xMin': Math.min(this.size, xMinTile.x),
        'xMax': Math.max(0, xMaxTile.x),
        'yMin': Math.min(this.size, yMinTile.y),
        'yMax': Math.max(0, yMaxTile.y),
    };
    return bounds;
}
Board.prototype.flip = function (direction) {
    if (this.directionIsValid(direction)) {
        console.log('direction is folgered');
        return false;
    }

    var selectedTiles = this.getSelectedTiles();
    if (selectedTiles.length == 0) {
        console.log('no selected tiles, ain\'t flippin\' jack squint');
        return false;
    }

    var bounds = this.getBoundsForTiles(selectedTiles);

    var tilesThatShouldBeFilled = [];
    for (var i = 0 ; i < selectedTiles.length ; i++) {
        var tile = selectedTiles[i];
        var x = tile.x, y = tile.y;
        if (direction == 'down') y = bounds.yMax + ((bounds.yMax - tile.y) + 1);
        if (direction == 'up') y = bounds.yMin - ((tile.y - bounds.yMin) + 1);
        if (direction == 'right') x = bounds.xMax + ((bounds.xMax - tile.x) + 1);
        if (direction == 'left') x = bounds.xMin - ((tile.x - bounds.xMin) + 1);

        // validate x and y bounds
        if (x < 0 || x > this.size ||
            y < 0 || y > this.size) {
            console.log('dieing for tile for bounds');
            return false;
        }

        // validate landing box
        var thisSillyTile = this.findTile(x, y);
        if (!thisSillyTile.isEmpty()) {
            return false;
        }

        tilesThatShouldBeFilled.push(thisSillyTile);
    }

    for (var i = 0 ; i < selectedTiles.length ; i++) {
        var selected = selectedTiles[i];
        selected.unselect();
    }

    for (var i = 0 ; i < tilesThatShouldBeFilled.length ; i++) {
        var thisSillyTile = tilesThatShouldBeFilled[i];
        thisSillyTile.fill();
    }
}
Board.prototype.select = function (x, y) {
    var tile = this.findTile(x, y);
    tile.select();
}
Board.prototype.toString = function () {
    var str = '';
    for (var i = 0 ; i < this.size ; i++) {
        for (var j = 0 ; j < this.size ; j++) {
            var tile = this.findTile(j, i);
            str += tile.toString();
        }
        str += "\n";
    }
    return str;
}

var tileAbstractions = {
    'easy': [
        [1, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ]
};

app.controller('IndexController', function () {

});

var a = new Board(tileAbstractions.easy);
a.select(0, 0);
console.log(a.toString());
a.flip('down');
console.log(a.toString());
a.select(0,0);
a.select(0,1);
console.log(a.toString());
a.flip('right');
console.log(a.toString());
