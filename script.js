let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let jump = 0;
let x = 100;
let y = 574;
let timer;
let rotationAngle = 0;
let movingUp = true;

function drawBackground() {
    ctx.fillStyle = 'white'
    ctx.save();
    ctx.translate(0, 650);
    ctx.beginPath();
    ctx.lineTo(0, 0);
    ctx.lineTo(1900, 0);
    ctx.lineTo(1900, 200);
    ctx.lineTo(0, 200);
    ctx.fill();
    // ctx.stroke();
    ctx.restore();
}

function drawBox(x, y) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(x, y,50,50);
}

function boxJump() {
    // ctx.save();
    // // for (let i = 0; i > -15; i--) {
    //     // ctx.clearRect(x,y,50,50);
    //     let i = 0;
    //     ctx.translate(0, i);
    //     ctx.rotate((-6 + i) * Math.PI/180);
    //     drawBox(x, y);
        
    //     if (i == -15) {
    //         clearInterval(timer);
    //     }
    //     i--;
    // // }
    // ctx.restore();
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // drawBackground();
    // for (let i = 0; i < 15; i++) {
    //     // Move the box upwards and rotate clockwise
    //     x = x + 3;
    //     y -= 10; // You can adjust the value to control the speed of upward movement
    //     rotationAngle += 6; // Rotate clockwise by 6 degrees per frame
        
    //     ctx.save();
    //     ctx.translate(x + 25, y + 25); // Translate to the center of the box
    //     ctx.rotate(rotationAngle * Math.PI / 180); // Rotate clockwise
    //     drawBox(-25, -25); // Draw the box centered at (x, y)
    //     ctx.restore();
    // }

    // for (let j = 0; j < 15; j++) {
    //     x -= 3;
    //     y += 10;
    //     rotationAngle -= 6;

    //     ctx.save();
    //     ctx.translate(x + 25, y + 25); // Translate to the center of the box
    //     ctx.rotate(rotationAngle * Math.PI / 180); // Rotate clockwise
    //     drawBox(25, 25); // Draw the box centered at (x, y)
    //     ctx.restore();
    // }
    if (movingUp) {
        y -= 2; // Move upwards
        rotationAngle += 6; // Rotate clockwise
        if (y <= 400) { // When the box reaches a certain height
            movingUp = false; // Start moving downwards
        }
    } else {
            // Move downwards
            y += 2;
            rotationAngle -= 6; // Rotate counterclockwise for downward movement
        }

        // Reset to initial position and start moving upwards again
        if (y >= 544) {
            y = 544;
            movingUp = true;
        
    }
    
    ctx.save();
    ctx.translate(x + 25, y + 25); // Translate to the center of the box
    ctx.rotate(rotationAngle * Math.PI / 180); // Rotate
    ctx.fillRect(-25, -25, 50, 50); // Draw the box using fillRect centered at (x, y)
    ctx.restore();
}

function init() {
    drawBackground();
    drawBox(x, y);
    document.addEventListener('keypress', function(event){
        if (event.key === " ") {
            timer = setInterval(boxJump, 50);
            boxJump();
        }
    })
}

document.addEventListener('DOMContentLoaded', init);