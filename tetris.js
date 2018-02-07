var canvas = document.getElementById('tetris');
var context = canvas.getContext('2d');

context.scale(20, 20);

var matrix = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
];

// checks for collision
function collide(gameBoard, player) {
    var [m, o] = [player.matrix, player.pos];
    for (var y = 0; y < m.length; ++y) {
        for (var x = 0; x < m[y].length; ++x) {
            if ((m[y][x] !== 0) && (gameBoard[y + o.y] && gameBoard[y + o.y][x + o.x]) !== 0)
            return true;
        }
    }
    return false;
}

// creates a matrix
function createMatrix(w, h) {
    var matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// create the different pieces for the game
function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    }  else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

// draws the game board and current player moves
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(gameBoard, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

// draws a matrix
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// clears the game board
function gameBoardSweep() {
    var rowCount = 1;
    outer: for (var y = gameBoard.length - 1; y > 0; --y) {
        for (var x = 0; x < gameBoard[y].length; ++x) {
            if (gameBoard[y][x] === 0) {
                continue outer;
            }
        }
        var row = gameBoard.splice(y, 1)[0].fill(0);
        gameBoard.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

// merges the current game board with the players moves
function merge(gameBoard, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                gameBoard[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

//
function playerDrop() {
    player.pos.y++;
    if (collide(gameBoard, player)) {
        player.pos.y--;
        merge(gameBoard, player);
        playerReset();
        gameBoardSweep();
        updateScore();
    }
    dropCounter = 0;
}

// Updates the move a player makes
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(gameBoard, player)) {
        player.pos.x -= dir;
    }
}

// Reset function for the game
function playerReset() {
    var pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (gameBoard[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(gameBoard, player)) {
        gameBoard.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

// Makes sure player rotate move is correct and doesnt collide with walls
function playerRotate(dir) {
    var pos = player.pos.x;
    var offset = 1;
    rotate(player.matrix, dir);
    while (collide(gameBoard, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// Rotates the pieces
function rotate(matrix, dir) {
    for (var y = 0; y < matrix.length; ++y) {
        for (var x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Time variables
var dropCounter = 0;
var dropInterval = 1000;
var lastTime = 0;

// Updates the game
function update(time = 0) {
    var deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = "Score: " + player.score;
}

// The different color of the pieces
var colors = [
    null,
    '#ff1a1a',
    '#1a1aff',
    '#29a329',
    '#ff9933',
    '#800080',
    '#ffcc00',
    '#ff66ff',
];

// Creates the game board
var gameBoard = createMatrix(12, 20);

// Init each player turn
var player = {
    pos: {x: 5, y: 5},
    matrix: null,
    score: 0,
};

// Listener for the key presses
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(+1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(+1);
    }
});

playerReset();
updateScore();
update();
