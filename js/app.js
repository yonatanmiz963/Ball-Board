var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src="img/candy.png" />';

var gBoard;
var gGamerPos;
var gBallInterval;
var gBallsCount = 0;
var gLeftBalls = 2;
var gGlueInterval;
var gIsGlued = false;


var collectSound = new Audio('sound/right.mp3');
var winSound = new Audio('sound/win.mp3');

function initGame() {
    gGlueInterval = null;
    gBallInterval = null;
    gBallsCount = 0;
    gLeftBalls = 2;
    gGamerPos = { i: 2, j: 9 };

    var elBallsCount = document.querySelector('.balls-count h3');
    elBallsCount.innerText = `Balls Collected: ${gBallsCount}`

    var elRestart = document.querySelector('.restart');
    elRestart.style.display = 'none';

    gBoard = buildBoard();
    renderBoard(gBoard);

    gBallInterval = setInterval(function() {
        var randomBall = getNewCell();
        if (gBoard[randomBall.i][randomBall.j].gameElement === BALL ||
            gBoard[randomBall.i][randomBall.j].gameElement === GAMER ||
            gBoard[randomBall.i][randomBall.j].gameElement === GLUE
        ) {
            return;
        } else {
            gBoard[randomBall.i][randomBall.j].gameElement = BALL;
            renderCell(randomBall, BALL_IMG);
            gLeftBalls += 1;
        }
    }, 2000);

    gGlueInterval = setInterval(function() {
        createGlue();
    }, 5000)
}


function buildBoard() {
    // Create the Matrix
    var board = createMat(10, 12)

    // Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            // Put FLOOR in a regular cell
            var cell = { type: FLOOR, gameElement: null };

            // Place Walls at edges
            if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
                cell.type = WALL;
            }
            // Passages
            if (i === 0 && j === 5 || i === 9 && j === 5 || i === 5 && j === 0 || i === 5 && j === 11) {
                cell.type = FLOOR;
            }


            // Add created cell to The game board
            board[i][j] = cell;
        }
    }

    // Place the gamer at selected position
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

    // Place the Balls (currently randomly chosen positions)
    board[3][8].gameElement = BALL;
    board[7][4].gameElement = BALL;

    // console.log(board);
    return board;
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j })

            // TODO - change to short if statement
            if (currCell.type === FLOOR) cellClass += ' floor';
            else if (currCell.type === WALL) cellClass += ' wall';

            //TODO - Change To template string
            strHTML += '\t<td class="cell ' + cellClass +
                '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

            // TODO - change to switch case statement
            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG;
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG;
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }

    // console.log('strHTML is:');
    // console.log(strHTML);
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
    if (gIsGlued) {
        return;
    }

    // console.log('new pos: ', i + ', ' + j);
    var targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return;

    // Calculate distance to make sure we are moving to a neighbor cell
    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);


    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

        if (targetCell.gameElement === BALL) {
            gLeftBalls -= 1;
            collectSound.play()
            gBallsCount++;
            var elBallsCount = document.querySelector('.balls-count h3');
            elBallsCount.innerText = `Balls Collected: ${gBallsCount}`

            if (gLeftBalls === 0) {
                gameOver();
            }
        }

        // MOVING from current position
        // Model:
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
        // Dom:
        renderCell(gGamerPos, '');

        if (i === 0 && j === 5) {
            gGamerPos.i = 9;
            gGamerPos.j = 5;

        } else if (i === 9 && j === 5) {
            gGamerPos.i = 0;
            gGamerPos.j = 5;

        } else if (i === 5 && j === 0) {
            gGamerPos.i = 5;
            gGamerPos.j = 11;

        } else if (i === 5 && j === 11) {
            gGamerPos.i = 5;
            gGamerPos.j = 0;

        } else {
            gGamerPos.i = i;
            gGamerPos.j = j;
        }

        // Checking if Gamer position is glue
        if (gBoard[gGamerPos.i][gGamerPos.j].gameElement === GLUE) {
            gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
            renderCell(gGamerPos, GAMER_IMG);

            console.log('ON GLUE!');
            gIsGlued = true;

            setTimeout(function() {
                gIsGlued = false;
            }, 3000);

        }
        // MOVING to selected position
        // Model:
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
        // DOM:
        renderCell(gGamerPos, GAMER_IMG);
    }
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

    var i = gGamerPos.i;
    var j = gGamerPos.j;

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1);
            break;
        case 'ArrowRight':
            moveTo(i, j + 1);
            break;
        case 'ArrowUp':
            moveTo(i - 1, j);
            break;
        case 'ArrowDown':
            moveTo(i + 1, j);
            break;
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}


// Adding a new ball every few seconds 
function getNewCell() {
    var random = { i: getRandomInt(1, 9), j: getRandomInt(1, 11) }
    return random
}


function gameOver() {
    clearInterval(gBallInterval);
    setTimeout(function() {
        winSound.play();
        var elWin = document.querySelector('.win');
        elWin.style.display = 'block';
        var elRestart = document.querySelector('.restart');
        elRestart.style.display = 'block';
    }, 1000)
    setTimeout(function() {
        var elWin = document.querySelector('.win');
        elWin.style.display = 'none';
    }, 4000)
}


function createGlue() {
    var lastGlue = null;
    var newGlue = getNewCell();
    console.log('new glue: ', newGlue);

    if (gBoard[newGlue.i][newGlue.j].gameElement === BALL ||
        gBoard[newGlue.i][newGlue.j].gameElement === GAMER) {
        return;
    }

    if (gBoard[newGlue.i][newGlue.j].gameElement === null) {
        // Updating model
        gBoard[newGlue.i][newGlue.j].gameElement = GLUE;
        // Updating dom
        renderCell(newGlue, GLUE_IMG);
        var lastGlue = newGlue;
    }

    setTimeout(() => {
        if (gBoard[lastGlue.i][lastGlue.j].gameElement === GAMER) {
            // Updating model
            gBoard[lastGlue.i][lastGlue.j].gameElement = GAMER;
        } else {
            // Updating model
            gBoard[lastGlue.i][lastGlue.j].gameElement = null;
            // Updating dom
            renderCell(lastGlue, '');
        }
    }, 3000);
}