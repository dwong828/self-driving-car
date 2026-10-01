const canvas=document.getElementById("myCanvas");
canvas.width=200;

const ctx = canvas.getContext("2d");
const road = new Road(canvas.width/2, canvas.width*0.9);
const car = new Car(road.getLaneCenter(1),100,30, 50);


animate();

function animate(){
    
    car.update();

    //resize canvas to height of browser even when user resizes browser 
    //clears the canvas, and gets rid of previous car rendering
    canvas.height=window.innerHeight;

    //this combination of save(), translate(), restore() will:
    //keep the car y-value fixed on the screen, and
    //the rest of the roads (and world) will render based on the car
    //this will make it look like the car is moving on the road
    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.7);

    road.draw(ctx);
    car.draw(ctx);

    ctx.restore();
    //calls animate function in a loop
    requestAnimationFrame(animate);
}
