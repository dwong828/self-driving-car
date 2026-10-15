const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width/2, carCanvas.width*0.9);
const car = new Car(road.getLaneCenter(1),100,30, 50, "AI");
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)
];

animate();

//the 'time' parameter is automatically sent as part of the 
//requestAnimationFrame() call
function animate(time){
    for (let i=0; i<traffic.length; i++){
        traffic[i].update(road.borders, []);
    }
    car.update(road.borders, traffic);

    //resize canvas to height of browser even when user resizes browser 
    //clears the canvas, and gets rid of previous car rendering
    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    //this combination of save(), translate(), restore() will:
    //keep the car y-value fixed on the screen, and
    //the rest of the roads (and world) will render based on the car
    //this will make it look like the car is moving on the road
    carCtx.save();
    carCtx.translate(0, -car.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for (let i=0; i<traffic.length; i++){
        traffic[i].draw(carCtx, "red");
    }
    car.draw(carCtx, "blue");

    carCtx.restore();


    //visual trick:  make the dashes pulse
    networkCtx.lineDashOffset = -time/50;

    //visualize neural network
    Visualizer.drawNetwork(networkCtx, car.brain);

    //calls animate function in a loop
    requestAnimationFrame(animate);
}
