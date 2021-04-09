let cvs = document.getElementById('canvas');
let ctx;

let ship = new Image();
let bullet = new Image();
let asteroid = new Image();

ship.src = './images/ship.png';
bullet.src = './images/bullet.png';
asteroid.src = './images/asteroid.png';

const moveSpeed = 2;
let numberOfCycle = 0;
let score;
let activeAnimation = true;

const mousePosition = {
    X: 0,
    Y: 0
}

//an array with all the elements to display
let elements = [{
    objectName: 'ship',
    X: 240,
    Y: 240,
    width: 20,
    height: 20,
}];

window.onmousemove = setMousePosition;   //

document.getElementById('canvas').onclick = createBullet;

//display a field with initial information and rules
function startMenu(){
    document.getElementById('startField').className = ''; 
    document.getElementById('gameField').className = 'invisible';
    document.getElementById('endField').className = 'invisible';
}

//resetting all initial data in case the player decides to restart the game
//display the field with the game
function startGame(){
    score = 0;
    elements[0].X = 240;
    elements[0].Y = 240;
    elements.length = 1;
    numberOfCycle = 0;

    document.getElementById('startField').className = 'invisible'; 
    document.getElementById('gameField').className = '';
    document.getElementById('endField').className = 'invisible';
    
    ctx = cvs.getContext('2d');

    activeAnimation = true;

    game();
}

//main function
function game(){
    if(numberOfCycle % 200 == 10){
        createAsteroid();
        createAsteroid();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawElements();
    calcElementsMove();
    checkCollision();
    
    //check whether the asteroids or the ship have gone beyond the field, and if so, return them from the other side
    elements.forEach((el)=>{
        if(el.objectName != 'bullet'){
            if(el.Y < 10) { el.Y += 470; }
            else if(el.X < 10) { el.X += 470; }
            else if(el.Y >= 480) { el.Y -= 470; }
            else if(el.X >= 480) { el.X -= 470; }
        }
    })
 
    deleteBullet();

    numberOfCycle++;

    document.getElementById('score').innerHTML = `Your current score: ${score}`;
    
    //restart the function if the game is not over
    if(activeAnimation){
        requestAnimationFrame(game);
    }    
}

//display of all elements
function drawElements(){
    for(let i = 0; i< elements.length; i++){
        if(elements[i].objectName == 'bullet'){
            ctx.drawImage(bullet, elements[i].X, elements[i].Y, 5, 5);
        } else if(elements[i].objectName == 'bigAsteroid'){
            ctx.drawImage(asteroid, elements[i].X, elements[i].Y, 75, 50);
        } else if(elements[i].objectName == 'smallAsteroid'){
            ctx.drawImage(asteroid, elements[i].X, elements[i].Y, 25, 10);
        } else if(elements[i].objectName == 'ship'){
            ctx.drawImage(ship, elements[0].X, elements[0].Y, elements[i].width, elements[i].height);
        }
    }
}

//update rounded mouse position data
function setMousePosition(event){
    mousePosition.X = event.offsetX - (event.offsetX % moveSpeed);
    mousePosition.Y = event.offsetY - (event.offsetY % moveSpeed);
}

//getting the angle between the element and the cursor
function angleBetweenObjectAndMouse(x1, y1, x2, y2) {
  var x = x2 - x1,
    y = y2 - y1;

  return Math.atan2(y, x) * 180 / Math.PI;
}

//creating a bullet
function createBullet(){
    elements.splice(1, 0, {
        objectName: 'bullet',
        X: elements[0].X,
        Y: elements[0].Y,
        angle: angleBetweenObjectAndMouse(elements[0].X, elements[0].Y, mousePosition.X, mousePosition.Y),
        width: 5,
        height: 5,
        }
    )
}

//calculation of the new position of each object depending on their angle
function calcElementsMove(){
    for(let i = 0; i< elements.length; i++){

        let angleRadians = (elements[i].angle * Math.PI) / 180;
        
        if(elements[i].objectName == 'bullet'){
            elements[i].X += Math.round(5 * moveSpeed * Math.cos(angleRadians));
            elements[i].Y += Math.round(5 * moveSpeed * Math.sin(angleRadians));
        } else if(elements[i].objectName == 'bigAsteroid'){
            elements[i].X += Math.round(1 * moveSpeed * Math.cos(angleRadians));
            elements[i].Y += Math.round(1 * moveSpeed * Math.sin(angleRadians));
        }else if(elements[i].objectName == 'smallAsteroid'){
            elements[i].X += Math.round(2 * moveSpeed * Math.cos(angleRadians));
            elements[i].Y += Math.round(2 * moveSpeed * Math.sin(angleRadians));
        } else if(elements[i].objectName == 'ship'){
            let angle = angleBetweenObjectAndMouse(elements[0].X, elements[0].Y, mousePosition.X, mousePosition.Y);
            angleRadians = (angle * Math.PI) / 180;
            elements[0].X += Math.round(2 * moveSpeed * Math.cos(angleRadians));
            elements[0].Y += Math.round(2 * moveSpeed * Math.sin(angleRadians));
        }
    }
}

//creating a new asteroid at any or a given point
function createAsteroid(objectName = 'bigAsteroid', width = 75, height = 50, startCoordinatesX, startCoordinatesY){
    let coordinates ={};
    if(startCoordinatesX == undefined || startCoordinatesY == undefined){
        coordinates = randomCoordinates();
    } else {
        coordinates = {
            X: startCoordinatesX,
            Y: startCoordinatesY
        }
    }   

    elements.push({
        objectName,
        X: coordinates.X,
        Y: coordinates.Y,
        angle: angleBetweenObjectAndMouse(coordinates.X, coordinates.Y, randomCoordinates().X, randomCoordinates().Y),
        width,
        height,
    })
}

//receives random coordinates, checks them for collision with the ship, and if a collision is present, calls himself again
function randomCoordinates(){
    let randomX = Math.random() * (460 - 40 ) + 40;
    let randomY = Math.random() * (460 - 25 ) + 25;

    if(elements[0].X < randomX + 75 && elements[0].X + elements[0].width > randomX && elements[0].Y < randomY + 50 && 
        elements[0].Y + elements[0].height > randomY){

        return randomCoordinates();
    } else {
        return {X: randomX - randomX % moveSpeed, Y: randomY - randomY % moveSpeed};
    }
}

//checking for collisions between bullets and asteroids, and between a ship and asteroids
function checkCollision(){
    for(let i = 0; i< elements.length; i++){
        if(elements[i].objectName == 'bullet'){
            for(let j = i+1; j< elements.length; j++){
                if(elements[j].objectName == 'smallAsteroid'){
                    if(elements[i].X < elements[j].X + elements[j].width && elements[i].X + elements[i].width > elements[j].X &&
                        elements[i].Y < elements[j].Y + elements[j].height && elements[i].Y + elements[i].height > elements[j].Y){

                            elements.splice(j,1);
                            elements.splice(i,1);

                            score += 100;
                    }
                } else if(elements[j].objectName == 'bigAsteroid'){
                    if(elements[i].X < elements[j].X + elements[j].width && elements[i].X + elements[i].width > elements[j].X &&
                        elements[i].Y < elements[j].Y + elements[j].height && elements[i].Y + elements[i].height > elements[j].Y){

                            createAsteroid('smallAsteroid', 25, 10, elements[j].X, elements[j].Y);
                            createAsteroid('smallAsteroid', 25, 10, elements[j].X, elements[j].Y);
                            
                            elements.splice(j,1);
                            elements.splice(i,1);

                            score += 150;
                    }
                }
            }
        } else if(elements[i].objectName == 'ship'){
            for(let j = i+1; j< elements.length; j++){
                if(elements[j].objectName == 'smallAsteroid' || elements[j].objectName == 'bigAsteroid'){
                    if(elements[i].X < elements[j].X + elements[j].width - 15 && elements[i].X + elements[i].width - 15 > elements[j].X &&
                        elements[i].Y < elements[j].Y + elements[j].height - 10 && elements[i].Y + elements[i].height - 10 > elements[j].Y){

                        endGame();
                    }
                } 
            }
        }
    }
}

//remove the bullet if it is not in the field
function deleteBullet(){
    for(let i=0; i < elements.length; i++){
        if(elements[i].objectName == 'bullet'){
            if(elements[i].X > 500 || elements[i].X < 0 || elements[i].Y > 500 || elements[i].Y < 0){
                elements.splice(i, 1);
            }
        }
    }
}

//display a field with the results and offer to play again
function endGame(){
    activeAnimation = false;
    document.getElementById('startField').className = 'invisible'; 
    document.getElementById('gameField').className = 'invisible';
    document.getElementById('endField').className = '';
    document.getElementById('endField').innerHTML = `<h1>Game over!</h1> <h2>Your score is: ${score}</h2> 
    Do you want play again? </br></br><button id="reset" onclick="startGame()">Reset game</button>`;
    console.log(`Score${score}`);
}