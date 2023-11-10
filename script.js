const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const CANVAS_HEIGHT = canvas.height;
const CANVAS_WIDTH = canvas.width;
const GROUND_HEIGHT = 200;
const GROUND_LINE = CANVAS_HEIGHT - GROUND_HEIGHT;
const CUBE_SIZE = 50;
let element;

//JUMP MOTION
const JUMP_PACE = 5;
let jump = 0;
let jump_height = 6;
let jump_timer;
let rotationAngle = 0;
let movingDown = false;

//OBSTACLE MOTION
const obstacle = document.createElement("canvas");
const obstacleCanvas = obstacle.getContext("2d");
obstacleCanvas.width = CANVAS_WIDTH;
obstacleCanvas.height = CANVAS_HEIGHT;
const OBSTACLE_PACE = 10;
let moveHorizontal = 0;
let obstacle_timer;
let moveLeft = false;
let obstacle_position = CANVAS_WIDTH + CUBE_SIZE;

//if player status = 0, game is over
let playerStatus = 1;

// colours for background and ground
let r = 0, g = 0, b = 200;

// for music
const audioPlayer = new Audio('BaseAfterBase.mp3');

function drawBackground() {
    ctx.save();
    ctx.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
    ctx.translate(0, GROUND_LINE);
    ctx.beginPath();
    ctx.lineTo(0, 0);
    ctx.lineTo(CANVAS_WIDTH, 0);
    ctx.lineTo(CANVAS_WIDTH, GROUND_HEIGHT);
    ctx.lineTo(0, GROUND_HEIGHT);
    ctx.fill();
    ctx.restore();

    const squareWidth = (CANVAS_WIDTH - 9 * 25) / 10;
    ctx.fillStyle = "rgb(" + (r - 50) + ", " + (g - 50) + ", " + (b - 50) + ")";
    for (let i = 0; i < 12; i++) {
        const x = i * (squareWidth + 25);
        ctx.fillRect(x, GROUND_LINE + 25, squareWidth, GROUND_HEIGHT - 25);
    }
}

function drawBox() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(CUBE_SIZE + 25, GROUND_LINE - CUBE_SIZE,CUBE_SIZE,CUBE_SIZE);
}

function boxJump() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBackground();
    ctx.save();
    console.log(jump);
    if (movingDown === false) {
        jump--;
        rotationAngle += 6;
        if (jump === -(CUBE_SIZE * 2)) {
            movingDown = true;
        }
    } else {
        jump++;
        if (jump === 0) {
            movingDown = false;
            clearInterval(jump_timer);
        }
    }
    ctx.translate(0, jump);
    drawBox();
    ctx.restore();
}

function drawObstacles() {
    ctx.fillStyle = 'red';
    // ctx.fillRect(CUBE_SIZE + CANVAS_WIDTH, GROUND_LINE - CUBE_SIZE,CUBE_SIZE,CUBE_SIZE);
    ctx.fillRect(obstacle_position, GROUND_LINE - CUBE_SIZE,CUBE_SIZE,CUBE_SIZE);
}

function moveObstacles() {
    // ctx.save();
    // moveHorizontal--;
    // if (moveHorizontal <= -CANVAS_WIDTH) {
    //     moveHorizontal = 0;
    // }
    
    // ctx.translate(moveHorizontal, 0);
    // drawObstacles();
    // ctx.restore();
    if (jump === 0){
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawBox();
        drawBackground();
    } else {
        ctx.clearRect(obstacle_position - JUMP_PACE, GROUND_LINE - CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    }
    obstacle_position -= JUMP_PACE;
    console.log(obstacle_position);
    if (obstacle_position <= 0) {
        obstacle_position = CANVAS_WIDTH + CUBE_SIZE;
    }
    drawObstacles();
}

function startTimers() {
    if (jump === 0) {
        jump_timer = setInterval(boxJump, JUMP_PACE);
        obstacle_timer = setInterval(moveObstacles, JUMP_PACE);
    }
}

function init() {
    drawBackground();
    drawBox();
    document.addEventListener('keyup', function(event){
        audioPlayer.play();
        if ((event.key === " ") && (jump === 0)) {
            startTimers();
        }
    })
}

document.addEventListener('DOMContentLoaded', init);