const canvas=document.getElementById("myCanvas");
canvas.width=200;

const ctx = canvas.getContext("2d");
const car = new Car(100,100,30, 50);

animate();

function animate(){
    car.update();

    //resize canvas to height of browser even when user resizes browser 
    //clears the canvas, and gets rid of previous car
    canvas.height=window.innerHeight;
    car.draw(ctx);
    //calls animate function in a loop
    requestAnimationFrame(animate);
}
