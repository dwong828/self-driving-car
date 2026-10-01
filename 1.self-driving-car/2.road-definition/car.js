class Car{
    constructor(x, y, width, height){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        this.speed=0;
        this.acceleration=0.2;
        this.maxSpeed = 3;
        this.friction=0.05;
        this.angle=0;

        this.controls=new Controls();
    }
    
    #move(){
        if(this.controls.forward){
            this.speed += this.acceleration;
        }
        if(this.controls.reverse){
            this.speed -= this.acceleration;
        }

        if(this.speed > this.maxSpeed){
            this.speed = this.maxSpeed;
        }
        if(this.speed < -this.maxSpeed/2){
            this.speed = -this.maxSpeed/2;
        }

        //add friction so car will roll to a stop after key up
        //rather than abrupt stop
        if(this.speed > 0){
            this.speed -= this.friction;
        }
        if(this.speed < 0){
            this.speed += this.friction;
        }
        if(Math.abs(this.speed) < this.friction){
            this.speed = 0;
        }

        if (this.speed != 0){
            //flip left and right if we are going
            const flip = this.speed > 0 ? 1: -1;

            if(this.controls.left){
                this.angle += 0.03 * flip;
            }
            if(this.controls.right){
                this.angle -= 0.03 * flip;
            }
        }

        //imagine a unit circle that is ROTATED 90 degrees CCW
        //so that 0-degrees is pointing up
        //given a point on the circle in the second quadrant:
        //cos(angle) = point on y-axis
        //sin(angle) = point on x-axis
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    update(){
        this.#move();
    }

    draw(ctx){
        ctx.save();
        //move origin (0,0) of canvas system to this new point
        //future drawings will be made relative to this new point
        ctx.translate(this.x, this.y);

        //negative argument means rotate counter clockwise
        //positive argument means rotate clockwise
        //argument is in radians.  0.03rad = 1.7degrees
        ctx.rotate(-this.angle);

        ctx.beginPath();
        ctx.rect(
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        ctx.fill();
     
        ctx.restore();
    }
}