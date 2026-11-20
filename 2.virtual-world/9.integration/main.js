const carCanvas=document.getElementById("carCanvas");
carCanvas.width=window.innerWidth - 330;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;
//resize canvas to height of browser even when user resizes browser 
//clears the canvas, and gets rid of previous car rendering
carCanvas.height=window.innerHeight;
networkCanvas.height=window.innerHeight;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");


const worldString = localStorage.getItem("world");
const worldInfo = worldString ? JSON.parse(worldString) : null;
const world = worldInfo
    ? World.load(worldInfo)
    : new World(new Graph());

const viewport = new Viewport(carCanvas, world.zoom, world.offset);


//genetic algorithm
//change N to generate lots of cars to find good weights
const N=1;
const cars = generateCars(N);
//initialize to first car in array
let bestCar=cars[0];

//get best brain from local storage, if it exists
if (localStorage.getItem("bestBrain")){
    for (let i=0; i<cars.length; i++){
        //get best brain from local storage
        cars[i].brain = JSON.parse(
             localStorage.getItem("bestBrain")
         );

         //keep the local storage best brain in car[0]
         //mutate all the other brains by some amount to try to find an even better brain 
         if (i!=0){
             NeuralNetwork.mutate(cars[i].brain, 0.1);
         }
    }

    // bestCar.brain = JSON.parse(
    //          localStorage.getItem("bestBrain")
    //      );
}

const traffic =[];

const roadBorders = world.roadBorders.map((s) => [s.p1, s.p2]);


//debug:  building borders
// const roadBorders = world.buildings
//     .map((b) => b.base.segments)  //this is an array of an array of segments
//     .flat() //converts array of array of segments => a single array of segments
//     .map((s) => [s.p1, s.p2]); //converts each Segment => an array of 2 points 

animate();

//user clicks save button, to save best brain to local storage
function save(){
    localStorage.setItem("bestBrain", 
        JSON.stringify(bestCar.brain)
    );
}

//user clicks discard button, to delete best brain from local storge
function discard(){
    localStorage.removeItem("bestBrain");
}

//genetic algorithm:  spawn lots of cars to find one with good weights/biases
function generateCars(N){
    const startPoints = world.markings.filter((m) => m instanceof Start);
    const startPoint = startPoints.length > 0
        ? startPoints[0].center
        : new Point(100, 100);

    const dir = startPoints.length > 0
        ? startPoints[0].directionVector
        : new Point(0, -1);  //point upward
    const startAngle = -angle(dir) + Math.PI/2;
    const cars=[];
    for (let i=0; i<N; i++){
        cars[i] = new Car(startPoint.x, startPoint.y, 30, 50, "AI", startAngle);
    }
    return cars;
}

//the 'time' parameter is automatically sent as part of the 
//requestAnimationFrame() call
function animate(time){
    for (let i=0; i<traffic.length; i++){
        traffic[i].update(roadBorders, []);
    }

    for (let j=0; j<cars.length; j++){
        cars[j].update(roadBorders, traffic);
    }

    //fitness function: find the car (out of N) with the minimum y-value
    //i.e. the one that drove the most upwards
    // bestCar = cars.find(
    //     c=>c.y == Math.min(...cars.map(c=>c.y))
    // );

    //use a new fitness function for the best car
    //it shouldn't be the one with the lowest Y-value b/c we're not driving upwards only
    //we are driving in a user-generated map now
    bestCar = cars.find(
        c=>c.fitness == Math.max(
            ...cars.map(c=>c.fitness)
        ));


    world.cars = cars;
    world.bestCar = bestCar;

    //let the viewport follow the best car
    viewport.offset.x = -bestCar.x;
    viewport.offset.y = -bestCar.y;


    //this is for viewing the world
    viewport.reset();
    //use this viewPoint to add 3D effects (to trees, etc.)
    //this should refer to the Point in the center of the screen
    const viewPoint = scale(viewport.getOffset(), -1);
    //draw world;  
    //   viewPoint arg is used for 3D effects
    //   showStartMarkings=false;  Don't show the car marking for the start position
    world.draw(carCtx, viewPoint, false);


    //this combination of save(), translate(), restore() will:
    //keep the car y-value fixed on the screen, and
    //the rest of the roads (and world) will render based on the car
    //this will make it look like the car is moving on the road
    // carCtx.save();
    // carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    for (let i=0; i<traffic.length; i++){
        traffic[i].draw(carCtx, "red");
    }

    // carCtx.globalAlpha=0.2;
    // for (let j=0; j<cars.length; j++){
    //     cars[j].draw(carCtx, "blue");
    // }
    // carCtx.globalAlpha=1;

    // //draw car0 again, so that it has full opacity (alpha=1)
    // //and set drawSensor=true, so that we only show sensors on 1 car (not all N)
    // bestCar.draw(carCtx, "blue", true);

    // carCtx.restore();


    //visual trick:  make the dashes pulse
    networkCtx.lineDashOffset = -time/50;
    networkCtx.clearRect(0,0,networkCanvas.width, networkCanvas.height);

    //visualize neural network
    Visualizer.drawNetwork(networkCtx, bestCar.brain);

    //calls animate function in a loop
    requestAnimationFrame(animate);
}
