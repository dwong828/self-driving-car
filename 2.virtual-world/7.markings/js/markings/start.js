class Start extends Marking{
    constructor(center, directionVector, width, height){
        super(center, directionVector, width, height);

        this.img = new Image();
        this.img.src = "car.png";
    }

    draw(ctx){
        ctx.save();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(angle(this.directionVector) - Math.PI/2);

        //put (0,0) at the center of the image
        ctx.drawImage(this.img, -this.img.width/2, -this.img.height/2);

        ctx.restore();
    }
}