const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width/2, carCanvas.width*0.9);

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

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2),
];

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
    const cars=[];
    for (let i=0; i<N; i++){
        cars[i] = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
    }
    return cars;
}

//the 'time' parameter is automatically sent as part of the 
//requestAnimationFrame() call
function animate(time){
    for (let i=0; i<traffic.length; i++){
        traffic[i].update(road.borders, []);
    }

    for (let j=0; j<cars.length; j++){
        cars[j].update(road.borders, traffic);
    }

    //fitness function: find the car (out of N) with the minimum y-value
    //i.e. the one that drove the most upwards
    bestCar = cars.find(
        c=>c.y == Math.min(...cars.map(c=>c.y))
    );

    //resize canvas to height of browser even when user resizes browser 
    //clears the canvas, and gets rid of previous car rendering
    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    //this combination of save(), translate(), restore() will:
    //keep the car y-value fixed on the screen, and
    //the rest of the roads (and world) will render based on the car
    //this will make it look like the car is moving on the road
    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for (let i=0; i<traffic.length; i++){
        traffic[i].draw(carCtx, "red");
    }

    carCtx.globalAlpha=0.2;
    for (let j=0; j<cars.length; j++){
        cars[j].draw(carCtx, "blue");
    }
    carCtx.globalAlpha=1;

    //draw car0 again, so that it has full opacity (alpha=1)
    //and set drawSensor=true, so that we only show sensors on 1 car (not all N)
    bestCar.draw(carCtx, "blue", true);

    carCtx.restore();


    //visual trick:  make the dashes pulse
    networkCtx.lineDashOffset = -time/50;

    //visualize neural network
    Visualizer.drawNetwork(networkCtx, bestCar.brain);

    //calls animate function in a loop
    requestAnimationFrame(animate);
}
