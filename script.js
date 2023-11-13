const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById('reset');

const CANVAS_HEIGHT = canvas.height;
const CANVAS_WIDTH = canvas.width;
const GROUND_HEIGHT = 200;
const GROUND_LINE = CANVAS_HEIGHT - GROUND_HEIGHT;
const CUBE_SIZE = 50;

//--JUMP MOTION--
const JUMP_PACE = 0.1;
let jump = 0;
let movingDown = false;
let jump_timer;
let jump_timer_active = false;

//--OBSTACLE MOTION--
const OBSTACLE_PACE = 10;
const NUM_OBSTACLES = 3;
const obstaclePositions = [];
let obstacle_position = CANVAS_WIDTH + CUBE_SIZE;
let moveHorizontal = 0;
let moveLeft = false;
let obstacle_timer_active = false;
let obstacle_timer;

//--PLATFORM MOTION--
const PLATFORM_PACE = 15;
const NUM_PLATFORM = 3;
const platformPositions = [];
let platform_position = CANVAS_WIDTH + CUBE_SIZE + 5;
let moveHorizontal_Platform = 0;
let moveLeft_Platform = false;
let platform_timer_active = false;
let platform_timer;

//--FOR MUSIC--
const audioPlayer = new Audio('BaseAfterBase.mp3');
const crashAudio = new Audio('crash.mp3');

//--IF GAME STATUS = 0, GAME IS OVER GAME RESETS--
let gameStatus = 1;
const progressBar = document.getElementById("myBar");

//--SCROLLING GROUND VARIABLES--
const squarePace = 4;
let squarePosition = 0;
let r = 0, g = 0, b = 200;

//--GAME OVER TEXT--
const centerX = canvas.width / 2
const centerY = canvas.height / 2

//-----MOVE FUNCTIONS-----
function boxJump() {
    drawBackground();
    drawObstacles();
    
    ctx.save();
    if (movingDown === false) {
        jump--;
        if (jump === -(CUBE_SIZE * 2.5)) {
            movingDown = true;
        }
    } else {
        jump++;
        if (jump === 0) {
            movingDown = false;
            clearInterval(jump_timer);
            jump_timer_active = false;
        }
    }
    ctx.translate(0, jump);
    drawBox();
    ctx.restore();
}

function moveObstacles() {
    if (jump === 0){
        drawBackground();
        drawBox();
    } else {
        ctx.clearRect(obstacle_position - OBSTACLE_PACE, GROUND_LINE - CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    }

    drawGround();
    drawObstacles();
    
    for (let i = 0; i < NUM_OBSTACLES; i++) {
        obstaclePositions[i] -= OBSTACLE_PACE - 4;

        if (obstaclePositions[i] <= 0) {
            obstaclePositions[i] = CANVAS_WIDTH + CUBE_SIZE;
        }
    }
    collision();
}

function movePlatforms() {
    if (jump === 0){
        drawBackground();
        drawPlatforms();
    } else {
        ctx.clearRect(platform_position - PLATFORM_PACE, GROUND_LINE - CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    }

    drawGround();
    drawPlatforms();
    
    for (let i = 0; i < NUM_PLATFORM; i++) {
        platformPositions[i] -= PLATFORM_PACE - 4;

        if (platformPositions[i] <= 0) {
            platformPositions[i] = CANVAS_WIDTH + CUBE_SIZE;
        }
    }
    collision();
}

//-----COLLISION VALIDATION-----
function collision() {
    let CUBE_X = CUBE_SIZE + 25;
    let CUBE_Y = GROUND_LINE - CUBE_SIZE - jump;
    let OBSTACLE_X = 0;
    let OBSTACLE_Y = 0;
    for (let i = 0; i < NUM_OBSTACLES; i++) {
        OBSTACLE_X = obstaclePositions[i];
        OBSTACLE_Y = GROUND_LINE - CUBE_SIZE;

        if (CUBE_X < OBSTACLE_X + CUBE_SIZE &&
            CUBE_X + CUBE_SIZE > OBSTACLE_X &&
            CUBE_Y < OBSTACLE_Y + CUBE_SIZE &&
            CUBE_Y + CUBE_SIZE > OBSTACLE_Y
            ) {
                audioPlayer.pause();
                stopTimers();
                break;
            }
    }
}

//-----TIMERS-----
function startTimers() {
    if (!jump_timer_active && jump === 0) {
        jump_timer_active = true;
        jump_timer = setInterval(boxJump, JUMP_PACE);
    }
    
    if (!obstacle_timer_active) {
        for (let i = 0; i < NUM_OBSTACLES; i++) {
            obstaclePositions.push(CANVAS_WIDTH + i * CANVAS_WIDTH / NUM_OBSTACLES);
        }
        obstacle_timer_active = true;
        obstacle_timer = setInterval(() => {
            moveObstacles();
            drawProgressBar();
        }, OBSTACLE_PACE);
    }

    // if (!platform_timer_active) {
    //     for (let i = 0; i < NUM_PLATFORM; i++) {
    //         i += 5;
    //         platformPositions.push(CANVAS_WIDTH + i * CANVAS_WIDTH / NUM_PLATFORM);
    //     }
    //     platform_timer_active = true;
    //     platform_timer = setInterval(movePlatforms, PLATFORM_PACE);
    // }
}

function stopTimers() {
    gameStatus = 0;
    clearInterval(jump_timer);
    clearInterval(obstacle_timer);
    clearInterval(platform_timer);
    obstacle_timer_active = false;
    jump_timer_active = false;
    platform_timer_active = false;
    gameOverText();
    crashAudio.play();
}

function resetObstacles() {
    for (let i = 0; i < NUM_OBSTACLES; i++) {
        ctx.clearRect(obstaclePositions[i] - OBSTACLE_PACE, GROUND_LINE - CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    }
    obstaclePositions.length = 0;
}

function resetButton() {
    resetObstacles();
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    obstacle_position = -CANVAS_WIDTH;
    jump = 0;
    movingDown = false;
    r = 0, g = 0, b = 200;
    drawBackground();
    drawGround();
    drawBox();
    backgroundColourChange();
    gameStatus = 1;
    button.style.display = 'none';
    audioPlayer.currentTime = 0;
}

//-----DRAW FUNCTIONS-----
function drawBackground() {
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT/2);
    gradient.addColorStop(0, "black");
    gradient.addColorStop(1, "rgb(" + (r - 75) + ", " + (g - 75) + ", " + (b - 75) + ")");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT);
    ctx.restore();
}

function drawGround() {
    ctx.save();
    ctx.fillStyle = "rgb("+r+", "+g+", "+b+")";
    ctx.translate(0, GROUND_LINE);
    ctx.beginPath();
    ctx.lineTo(0, 0);
    ctx.lineTo(CANVAS_WIDTH, 0);
    ctx.lineTo(CANVAS_WIDTH, GROUND_HEIGHT);
    ctx.lineTo(0, GROUND_HEIGHT);
    ctx.fill();
    ctx.restore();
    drawScrollingGround();
}

function backgroundColour() {
    let maxColor = Math.max(r, g, b);

        if (b === maxColor) {
            ctx.fillStyle = "rgb(" + r + ", 0, 0)";
        } else if (r === maxColor) {
            ctx.fillStyle = "rgb(0, " + g + ", 0)";
        } else {
            ctx.fillStyle = "rgb(0, 0, " + b + ")";
        }
}

function backgroundColourChange() {
    setTimeout(function () {
        r = 200;
        g = 0;
        b = 0;
        backgroundColour();
    }, 2000);

    setTimeout(function () {
        r = 0;
        g = 200;
        b = 0;
        backgroundColour();
    }, 4000);

    setTimeout(function () {
        r = 0;
        g = 0;
        b = 200;
        backgroundColour();
    }, 6000);
}



function drawBox() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(CUBE_SIZE + 25, GROUND_LINE - CUBE_SIZE,CUBE_SIZE,CUBE_SIZE);
}

function drawObstacles() {
    ctx.fillStyle = 'red';
    for (let i = 0; i < NUM_OBSTACLES; i++) {
        const obstacleX = obstaclePositions[i];
        ctx.fillRect(obstacleX, GROUND_LINE - CUBE_SIZE,CUBE_SIZE,CUBE_SIZE);
    }
}

function drawPlatforms() {
    ctx.fillStyle = 'black';
    for (let i = 0; i < NUM_PLATFORM; i++) {
        const platformX = platformPositions[i];
        ctx.fillRect(platformX, GROUND_LINE - CUBE_SIZE,CUBE_SIZE,CUBE_SIZE);
    }
}

function drawScrollingGround() {
    const squareWidth = CANVAS_WIDTH / 10;
    ctx.fillStyle = "rgb("+(r - 50)+", "+(g - 50)+", "+(b - 50)+")";
    
    for (let i = 0; i < 10; i++) {
        let x = (i * (squareWidth + 25) + squarePosition);
        ctx.fillRect(x, GROUND_LINE + 25, squareWidth, GROUND_HEIGHT - 25);
    }
    squarePosition -= squarePace;

    if (squarePosition <= -squareWidth - 25) {
        squarePosition = 0;
    }
}

function drawProgressBar() {
    const progressBar_width = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = progressBar_width + '%';
}

function gameOverText() {
    ctx.textAlign = "center";
    ctx.fillStyle = "red";
    ctx.font = "125px Comic Sans MS";
    ctx.fillText("GAME OVER!", centerX + 2, centerY + 2);
    ctx.font = "40px Comic Sans MS";
    ctx.fillText("You crashed.", centerX + 2, centerY + 52);

    ctx.font = "125px Comic Sans MS";
    ctx.fillText("GAME OVER!", centerX - 2, centerY - 2);
    ctx.font = "40px Comic Sans MS";
    ctx.fillText("You crashed.", centerX - 2, centerY + 48);

    ctx.fillStyle = "white";
    ctx.font = "125px Comic Sans MS";
    ctx.fillText("GAME OVER!", centerX, centerY);
    ctx.font = "40px Comic Sans MS";
    ctx.fillText("You crashed.", centerX, centerY + 50);
    button.style.display = 'flex';
  }

function init() {
    gameStatus = 1
    drawBackground();
    drawGround();
    drawBox();
    backgroundColourChange();

    document.addEventListener('keyup', function(event){
        if (gameStatus === 1) {
            if (((event.key === " ") && (jump === 0)) || ((event.key === "ArrowUp") && (jump === 0))) {
                audioPlayer.play();
                startTimers();
            } 
        } else {
            gameStatus = 0;
        }
    });
}

document.addEventListener('DOMContentLoaded', init);