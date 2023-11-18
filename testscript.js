const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById('reset');

const CANVAS_HEIGHT = canvas.height;
const CANVAS_WIDTH = canvas.width;
const GROUND_HEIGHT = 200;
const GROUND_LINE = CANVAS_HEIGHT - GROUND_HEIGHT;
const CUBE_SIZE = 75;

//--JUMP MOTION--
// const JUMP_PACE = 0.5;
const JUMP_PACE = 0.05;
let jump = 0;
let movingDown = false;
let jumpTimer;
let jumpTimerActive = false;
const JUMP_HEIGHT = 150;

//--OBSTACLE MOTION--
const OBSTACLE_PACE = 15;
const NUM_OBSTACLES = 3;
const obstaclePositions = [];
let obstacle_position = CANVAS_WIDTH + CUBE_SIZE;
let moveLeft = false;
let obstacle_timer_active = false;
let obstacle_timer;

//--PLATFORM MOTION--
const PLATFORM_PACE = 10;
const NUM_PLATFORM = 3;
const platformPositions = [];
let platform_position = CANVAS_WIDTH + CUBE_SIZE + 5;
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
let onPlatform = false;

function boxJump() {
    let CUBE_X = CUBE_SIZE + 250;
    let CUBE_Y = GROUND_LINE - CUBE_SIZE - jump;
    let PLATFORM_X = 0;
    let PLATFORM_Y = 0;

    drawBackground();
    drawObstacles();
    drawPlatforms();

    for (let i = 0; i < NUM_PLATFORM; i++) {
        PLATFORM_X = platformPositions[i];
        PLATFORM_Y = GROUND_LINE - CUBE_SIZE;

        if (CUBE_X < PLATFORM_X + CUBE_SIZE &&
            CUBE_X + CUBE_SIZE > PLATFORM_X &&
            CUBE_Y < PLATFORM_Y + CUBE_SIZE &&
            CUBE_Y + CUBE_SIZE > PLATFORM_Y) {
            onPlatform = true;
            console.log(onPlatform);
            break;
        } else {
            if (jump <= 0 && onPlatform) {
                onPlatform = false;
                console.log(onPlatform);
            }
        }
    }

    ctx.save();

    if (movingDown === false && !onPlatform) {
        jump -= 2;
        if (jump <= -JUMP_HEIGHT) {
            movingDown = true;
        }
    } else {
        if (jump === 0 && !onPlatform) {
            movingDown = false;
            clearInterval(jumpTimer);
            jumpTimerActive = false;
        } else if (jump <= 0 && onPlatform) {
            jumpTimerActive = false;
        } else if (jump === 0 && onPlatform) {
            onPlatform = false;
        } else {
            jump += 2;
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
    drawPlatforms();
    
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
        drawBox();
    } else {
        ctx.clearRect(platform_position - PLATFORM_PACE, GROUND_LINE - CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    }

    drawGround();
    drawObstacles();
    drawPlatforms();
    
    for (let i = 0; i < NUM_PLATFORM; i++) {
        platformPositions[i] -= PLATFORM_PACE - 4;

        if (platformPositions[i] <= 0) {
            platformPositions[i] = CANVAS_WIDTH + CUBE_SIZE;
        }
    }
}

//-----COLLISION VALIDATION-----
function collision() {
    let CUBE_X = CUBE_SIZE + 250;
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
    if (!jumpTimerActive && jump === 0) {
        jumpTimerActive = true;
        jumpTimer = setInterval(boxJump, JUMP_PACE);
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

    if (!platform_timer_active) {
        for (let i = 0; i < NUM_PLATFORM; i++) {
            i += 5;
            platformPositions.push(CANVAS_WIDTH + i * CANVAS_WIDTH / NUM_PLATFORM);
        }
        platform_timer_active = true;
        platform_timer = setInterval(movePlatforms, PLATFORM_PACE);
    }
}

function stopTimers() {
    gameStatus = 0;
    clearInterval(jumpTimer);
    clearInterval(obstacle_timer);
    clearInterval(platform_timer);
    obstacle_timer_active = false;
    jumpTimerActive = false;
    platform_timer_active = false;
    gameOverText();
    crashAudio.play();
}

function resetObstaclesPlatforms() {
    for (let i = 0; i < NUM_OBSTACLES; i++) {
        ctx.clearRect(obstaclePositions[i] - OBSTACLE_PACE, GROUND_LINE - CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    }
    obstaclePositions.length = 0;
    for (let i = 0; i < NUM_PLATFORM; i++) {
        ctx.clearRect(platformPositions[i] - OBSTACLE_PACE, GROUND_LINE - CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    }
    platformPositions.length = 0;
}

function resetButton() {
    resetObstaclesPlatforms();
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

const playerColours = [
    'Yellow','Orange', 'Red', 'Cyan', 'LightBlue', 'Red',
    'Green', 'Silver', 'White', 'PeachPuff', 'Plum'
    ];

let fillColour, strokeColour;
do {
    fillColour = playerColours[Math.floor(Math.random() * playerColours.length)];
    strokeColour = playerColours[Math.floor(Math.random() * playerColours.length)];
} while (fillColour === strokeColour);

function drawBox() {

    ctx.lineWidth = 2
    ctx.fillStyle = fillColour;
    ctx.strokeStyle = strokeColour;

    //body 
    ctx.beginPath();
    ctx.moveTo(CUBE_SIZE + 250, GROUND_LINE - CUBE_SIZE);
    ctx.lineTo(CUBE_SIZE + 75 + 250, GROUND_LINE - CUBE_SIZE);
    ctx.lineTo(CUBE_SIZE + 75 + 250, GROUND_LINE - CUBE_SIZE + 45);
    ctx.lineTo(CUBE_SIZE + 75 + 250, GROUND_LINE - CUBE_SIZE + 45);
    ctx.lineTo(CUBE_SIZE + 47.5 + 250, GROUND_LINE - CUBE_SIZE + 45);
    ctx.lineTo(CUBE_SIZE + 47.5 + 250, GROUND_LINE - CUBE_SIZE + 60);
    ctx.lineTo(CUBE_SIZE + 75 + 250, GROUND_LINE - CUBE_SIZE + 60);
    ctx.lineTo(CUBE_SIZE + 75 + 250, GROUND_LINE - CUBE_SIZE + 75);
    ctx.lineTo(CUBE_SIZE + 250, GROUND_LINE - CUBE_SIZE + 75);
    ctx.lineTo(CUBE_SIZE + 250, GROUND_LINE - CUBE_SIZE + 60);
    ctx.lineTo(CUBE_SIZE + 27.5 + 250, GROUND_LINE - CUBE_SIZE + 60);
    ctx.lineTo(CUBE_SIZE + 27.5 + 250, GROUND_LINE - CUBE_SIZE + 45);
    ctx.lineTo(CUBE_SIZE + 250, GROUND_LINE - CUBE_SIZE + 45);
    ctx.lineTo(CUBE_SIZE + 250, GROUND_LINE - CUBE_SIZE);
    ctx.fill();
    ctx.stroke();

    //eyes
    ctx.fillStyle = strokeColour;
    
    ctx.beginPath();
    ctx.moveTo(CUBE_SIZE + 15 + 250, GROUND_LINE - CUBE_SIZE + 15);
    ctx.lineTo(CUBE_SIZE + 30 + 250, GROUND_LINE - CUBE_SIZE + 15);
    ctx.lineTo(CUBE_SIZE + 30 + 250, GROUND_LINE - CUBE_SIZE + 30);
    ctx.lineTo(CUBE_SIZE + 15 + 250, GROUND_LINE - CUBE_SIZE + 30);  
    ctx.fill();

    ctx.moveTo(CUBE_SIZE + 45 + 250, GROUND_LINE - CUBE_SIZE + 15);
    ctx.lineTo(CUBE_SIZE + 60 + 250, GROUND_LINE - CUBE_SIZE + 15);
    ctx.lineTo(CUBE_SIZE + 60 + 250, GROUND_LINE - CUBE_SIZE + 30);
    ctx.lineTo(CUBE_SIZE + 45 + 250, GROUND_LINE - CUBE_SIZE + 30);  
    ctx.fill();
}

function drawObstacles() {
    for (let i = 0; i < NUM_OBSTACLES; i++) {
        const obstacleX = obstaclePositions[i];
        ctx.lineWidth = 3
        ctx.strokeStyle = "white";
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(obstacleX, GROUND_LINE);
        ctx.lineTo(obstacleX + 70, GROUND_LINE); 
        ctx.lineTo(obstacleX + 35, GROUND_LINE - CUBE_SIZE + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}



function drawPlatforms() {
    ctx.lineWidth = 3
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white'
    for (let i = 0; i < NUM_PLATFORM; i++) {
        const platformX = platformPositions[i];
        ctx.fillRect(platformX, GROUND_LINE - CUBE_SIZE,CUBE_SIZE,CUBE_SIZE);
        ctx.strokeRect(platformX, GROUND_LINE - CUBE_SIZE,CUBE_SIZE,CUBE_SIZE);
    
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


// jumppad is currently unused
let flippedX = -canvas.width / 2;
let flippedY = -canvas.height / 2

function drawJumpPad() {
    ctx.lineWidth = 3
    ctx.strokeStyle = 'gold';
    ctx.fillStyle = 'yellow';
    ctx.save();
    ctx.beginPath();
    ctx.rotate(Math.PI);
    ctx.arc(flippedX, flippedY, 50, 0, 1* Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
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


    document.addEventListener('keydown', function(event){
        if (gameStatus === 1) {
            if ((event.key === " " || event.key === "ArrowUp") && (jump === 0 || onPlatform)) {
                audioPlayer.play();
                startTimers();
            } 
        } else {
            gameStatus = 0;
        }
    });
}

document.addEventListener('DOMContentLoaded', init);