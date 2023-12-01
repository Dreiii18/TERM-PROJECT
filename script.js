const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById('reset');
const endScreen = document.getElementById('endScreen');
const counter = document.getElementById('counter');

const CANVAS_HEIGHT = canvas.height;
const CANVAS_WIDTH = canvas.width;
const GROUND_HEIGHT = 200;
const GROUND_LINE = CANVAS_HEIGHT - GROUND_HEIGHT;
const CUBE_SIZE = 75;

//--JUMP MOTION--
const JUMP_PACE = 4;
let jump = 0;
let movingDown = false;
let jumpTimer;
let jumpTimerActive = false;
let JUMP_HEIGHT = 150;

//--OBSTACLE MOTION--
const OBSTACLE_PACE = 15;
const NUM_OBSTACLES = 2;
let obstaclePositions = [];
let obstacle_position = CANVAS_WIDTH
let moveLeft = false;
let obstacleTimerActive = false;
let obstacleTimer;

//--PLATFORM MOTION--
const PLATFORM_PACE = 15;
const NUM_PLATFORM = 3;
let platformPositions = [];
let platform_position = CANVAS_WIDTH + CUBE_SIZE + 5;
let moveLeft_Platform = false;
let platformTimerActive = false;
let platformTimer;
let boxY;

//--FOR MUSIC--
const audioPlayer = new Audio('Jumper.mp3');
const crashAudio = new Audio('crash.mp3');
audioPlayer.addEventListener('ended', function() {
    gameStatus = 2;
    attempts = 1;
    obstacleTimerActive = false;
    jumpTimerActive = false;
    platformTimerActive = false;
    clearInterval(obstacleTimer);
    clearInterval(platformTimer);
    clearInterval(colourTimer);
    endGameScreen();
})

//--IF GAME STATUS = 0, GAME IS OVER GAME RESETS--
let gameStatus = 1;
const progressBar = document.getElementById("myBar");
let attempts = 1;

//--SCROLLING GROUND VARIABLES--
const squarePace = 5.5;
let squarePosition = 0;
let r = 0, g = 0, b = 200;

//--GAME OVER TEXT--
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

//-----MOVE FUNCTIONS-----
let onPlatform = false;
let PLATFORM_X = 0;
let PLATFORM_Y = 0;

//----BACKGROUND COLOUR CHANGE----
let colourTimer;
let timeColour = 0;
let colourChange = false;

//---- RANDOM PLAYER COLOURS----
const playerColours = [
    'Yellow','Orange', 'Red', 'Cyan', 'LightBlue', 'Red',
    'Green', 'Silver', 'White', 'PeachPuff', 'Plum'
    ];

let fillColour, strokeColour;
let yellow = 'yellow'

do {
    fillColour = playerColours[Math.floor(Math.random() * playerColours.length)];
    strokeColour = playerColours[Math.floor(Math.random() * playerColours.length)];
} while (fillColour === strokeColour);

function boxJump() {
    let CUBE_X = CUBE_SIZE + 250;
    let CUBE_Y = GROUND_LINE - CUBE_SIZE - jump;
   
    drawBackground();
    
    drawObstacles();
    drawPlatforms();
    
    onPlatform = false; 

    for (let i = 0; i < NUM_PLATFORM; i++) {
        PLATFORM_X = platformPositions[i];
        PLATFORM_Y = GROUND_LINE + (CUBE_SIZE * i);

        if (
            CUBE_X + CUBE_SIZE > PLATFORM_X &&
            CUBE_X < PLATFORM_X + CUBE_SIZE &&
            CUBE_Y <= PLATFORM_Y
        ) {
            onPlatform = true;
            break;
        } else {
            onPlatform = false;
        }
    }

    ctx.save();
    if (movingDown === false && (onPlatform == false) && (jumpTimerActive === true)) {
        if (jump <= -JUMP_HEIGHT) {
            movingDown = true;
        } else {
            jump -= 2.5;
        }
    } else {
        if (jump === 0 && (onPlatform == false)) {
            JUMP_HEIGHT = 150;
            movingDown = false;
            clearInterval(jumpTimer);
            jumpTimerActive = false;
        } else if (jump <= 0 && (onPlatform == true)){
            // console.log(jump);
            jumpTimerActive = false;
            movingDown = false;
            JUMP_HEIGHT += 1.5;
            document.addEventListener('keydown', function(event) {
                if ((event.key === " " || event.key === "ArrowUp") && gameStatus === 1) {
                    clearInterval(jumpTimer);
                    jumpTimerActive = true;
                    onPlatform = false;
                    jumpTimer = setInterval(boxJump, JUMP_PACE);
                }
            })
        } else {
            jump += 2.5;
        }
    }

    ctx.translate(0, jump);
    drawPlayer();
    ctx.restore();

}

function moveObstacles() {
    for (let i = 0; i < NUM_OBSTACLES; i++) {
        obstaclePositions[i] -= OBSTACLE_PACE - 4;

        if (obstaclePositions[i] <= 0) {
            obstaclePositions[i] = CANVAS_WIDTH + CUBE_SIZE;
        }
        if (jump === 0){
            drawBackground();
            drawPlayer();
        // } else {
        //     ctx.clearRect(obstaclePositions[i] - OBSTACLE_PACE, GROUND_LINE - CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
        }
    }

    drawGround();
    drawObstacles();
    drawPlatforms();
    
    collision();
}

function movePlatforms() {
    for (let i = 0; i < NUM_PLATFORM; i++) {
        platformPositions[i] -= PLATFORM_PACE - 4;

        if (platformPositions[i] <= 0) {
            platformPositions[i] = CANVAS_WIDTH + CUBE_SIZE;
        }
        if (jump === 0){
            drawBackground();
            drawPlayer();
        } else {
            // ctx.clearRect(platformPositions[i] - PLATFORM_PACE, GROUND_LINE - CUBE_SIZE - (CUBE_SIZE * i), CUBE_SIZE, CUBE_SIZE);
        }
    }

    drawGround();
    drawObstacles();
    drawPlatforms();

    collision();
}

//-----COLLISION VALIDATION-----
function collision() {
    let CUBE_X = CUBE_SIZE + 250;
    let CUBE_Y = GROUND_LINE - CUBE_SIZE - jump;
    let OBSTACLE_X = 0;
    let OBSTACLE_Y = 0;
    let PLATFORM_X = 0;
    let PLATFORM_Y = 0;
    for (let i = 0; i < NUM_OBSTACLES; i++) {
        OBSTACLE_X = obstaclePositions[i];
        OBSTACLE_Y = GROUND_LINE - CUBE_SIZE - 35;

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

    for (let j = 0; j < NUM_PLATFORM; j++) {
        PLATFORM_X = platformPositions[j];
        // PLATFORM_Y = GROUND_LINE - CUBE_SIZE;
        PLATFORM_Y = GROUND_LINE + (CUBE_SIZE * j);
        
        if (CUBE_X < PLATFORM_X + CUBE_SIZE &&
            CUBE_X + CUBE_SIZE > PLATFORM_X && 
            CUBE_Y < PLATFORM_Y) {
                audioPlayer.pause();
                stopTimers();
                break;
        } 
    }
}

//-----TIMERS-----
function stopTimers() {
    drawBackground();
    drawGround();
    drawObstacles();
    drawPlatforms();
    gameOverText();
    gameStatus = 0;
    clearInterval(jumpTimer);
    clearInterval(obstacleTimer);
    clearInterval(platformTimer);
    clearInterval(colourTimer)
    obstacleTimerActive = false;
    jumpTimerActive = false;
    platformTimerActive = false;
    crashAudio.play();
}

function startTimers() {
    if (!jumpTimerActive && jump === 0) {
        jumpTimerActive = true;
        jumpTimer = setInterval(boxJump, JUMP_PACE);
    }
    
    if (!obstacleTimerActive) {
        for (let i = 0; i < NUM_OBSTACLES; i++) {
            obstaclePositions.push((CANVAS_WIDTH + i * CANVAS_WIDTH / NUM_OBSTACLES + 1200));
        }
        obstacleTimerActive = true;
        obstacleTimer = setInterval(() => {
            moveObstacles();
            drawProgressBar();
        }, OBSTACLE_PACE);
    }

    if (!platformTimerActive) {
        for (let i = 1; i <= NUM_PLATFORM; i++) {
            i -= 0.5;
            platformPositions.push(CANVAS_WIDTH + i * CANVAS_WIDTH / NUM_PLATFORM);
        }
        platformTimerActive = true;
        platformTimer = setInterval(movePlatforms, PLATFORM_PACE);
    }
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
    JUMP_HEIGHT = 150;
    // gameStatus = 1;
    movingDown = false;
    timeColour = 0;
    colourChange = false;
    r = 0, g = 0, b = 200;
    drawBackground();
    drawGround();
    drawPlayer();
    backgroundColourChange();
    
    button.style.display = 'none';
    endScreen.style.display = 'none'
    counter.style.display = 'none';
    audioPlayer.currentTime = 0;

    if (gameStatus == 2 ) {
        gameStatus = 1;
    } else {
        showAttempts();
        gameStatus = 1;
    }
    attempts += 1;
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
    if (gameStatus === 1) {
        switch (timeColour) {
            case 1050:
            case 3234:
            case 5358:
            case 7015:
            case 8363.3:
                r = 200;
                g = 0;
                b = 0;
                backgroundColour();
                break;
            case 2137:
            case 3748:
            case 5922:
            case 7555:
                r = 0;
                g = 200;
                b = 0;
                backgroundColour();
                break;
            case 2700:
            case 4311:
            case 6476.7:
            case 8095:
                r = 0;
                g = 0;
                b = 200;
                backgroundColour();
                break;
            case 8600:
                r = 200;
                g = 200;
                b = 200;
                backgroundColour();
                break;
            case 8633.3: 
                r = 0;
                g = 0;
                b = 0;
                backgroundColour();
                break;
                
            case 300:    
                gameStatus = 2;
                // obstaclePositions = [];
                // platformPositions = [];
                backgroundColour();
                break;
        }

    }
}

function drawPlayer() {
    ctx.lineWidth = 2;
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
        // console.log(obstacleX)
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
    ctx.lineWidth = 3;
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';

    for (let i = 0; i < NUM_PLATFORM; i++) {
        const platformX = platformPositions[i];
        if (i === 0) {
            boxY = GROUND_LINE - (CUBE_SIZE * (i+1));
            ctx.fillRect(platformX, boxY, CUBE_SIZE, CUBE_SIZE);
            ctx.strokeRect(platformX, boxY, CUBE_SIZE, CUBE_SIZE);
        } else if (i == 1) {
            for (let j = 0; j < 2; j++) { 
                boxY = GROUND_LINE - (CUBE_SIZE * (j+1));
                ctx.fillRect(platformX, boxY, CUBE_SIZE, CUBE_SIZE);
                ctx.strokeRect(platformX, boxY, CUBE_SIZE, CUBE_SIZE);
            }
        } else {
            for (let j = 0; j < 3; j++) { 
                boxY = GROUND_LINE - (CUBE_SIZE * (j+1));
                ctx.fillRect(platformX, boxY, CUBE_SIZE, CUBE_SIZE);
                ctx.strokeRect(platformX, boxY, CUBE_SIZE, CUBE_SIZE);
            }
        }
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

function introText(yellow) {
    ctx.textAlign = "center";

    ctx.fillStyle = "black";
    ctx.font = "100px Comic Sans MS";
    ctx.fillText("THE PLAUSIBLE GAME", centerX + 2, centerY - 198);

    ctx.font = "50px Comic Sans MS";
    ctx.fillText("PRESS SPACEBAR TO START", centerX, centerY + 202);


    ctx.fillStyle = "rgb(175,250,100)"
    ctx.font = "100px Comic Sans MS";
    ctx.fillText("THE PLAUSIBLE GAME", centerX, centerY - 200);

    ctx.fillStyle = yellow;
    ctx.font = "50px Comic Sans MS";
    ctx.fillText("PRESS SPACEBAR TO START", centerX, centerY + 200);

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

function endGameScreen() {
    ctx.lineWidth = 20;
    ctx.strokeStyle = "rgb(175,250,100)"
    ctx.strokeRect(400, 150, 1100, 550);

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(400, 150, 1100, 550);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillStyle = "rgb(0,255,255)"
    ctx.fillRect(375, 125, 50, 50);
    ctx.strokeRect(375, 125, 50, 50);
    ctx.fillRect(1475, 125, 50, 50);
    ctx.strokeRect(1475, 125, 50, 50);
    ctx.fillRect(375, 675, 50, 50);
    ctx.strokeRect(375, 675, 50, 50);
    ctx.fillRect(1475, 675, 50, 50);
    ctx.strokeRect(1475, 675, 50, 50);
    ctx.fillRect(925, 675, 50, 50);
    ctx.strokeRect(925, 675, 50, 50);
    button.style.display = 'flex';
    endScreen.style.display = 'block';
    counter.style.display = 'block';
    counter.innerHTML = "ATTEMPTS: " + attempts;
}

function showAttempts() {
    ctx.textAlign = "center";
    ctx.font = "80px Comic Sans MS";
    
    ctx.fillStyle = "black";
    ctx.fillText("ATTEMPTS: "+ attempts, centerX + 2, centerY + 2);

    ctx.fillStyle = "white"; 
    ctx.fillText("ATTEMPTS: " + attempts, centerX, centerY);
    
}

function init() {
    gameStatus = 1;
    drawBackground();
    drawGround();
    drawPlayer();

    let bulbOn = true;
    let blinkTimer = setInterval(function() {
        let randomColour = "rgb("+Math.floor(Math.random() * 256)+", "+Math.floor(Math.random() * 256)+", "+Math.floor(Math.random() * 256)+")";
        let setColour = bulbOn ? yellow : randomColour;
        introText(setColour);
        bulbOn = bulbOn ? false : true;
    },500)

    document.addEventListener('keydown', function(event){
        if (gameStatus === 1) {
            if ((event.key === " " || event.key === "ArrowUp") && (jump === 0 || onPlatform == true)) {
                clearInterval(blinkTimer);
                audioPlayer.play();
                
                if (!colourChange) {
                    colourChange = true;
                    colourTimer = setInterval(function () {
                        timeColour++;
                        backgroundColourChange();
                    }, 10); //centiseconds
                }
                startTimers();
            }
        } else {
            colourChange = false;
            gameStatus = 0;
        }
    });
}

document.addEventListener('DOMContentLoaded', init);