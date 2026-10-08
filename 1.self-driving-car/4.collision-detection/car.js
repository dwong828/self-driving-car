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
        this.damaged = false;

        this.sensor=new Sensor(this);
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

    update(roadBorders){
        if (!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders);
        }
        this.sensor.update(roadBorders);
    }

    //check if car intersects with road borders
    #assessDamage(roadBorders){
        for (let i=0; i<roadBorders.length; i++){
            if (polysIntersect(this.polygon, roadBorders[i])){
                return true;
            }
        }
        return false;
    }

    //create border of car, identified by the car's 4 corners
    #createPolygon(){
        //store corners of the car
        const points=[];

        //let's consider the rectangle shape for the car
        //let's call the distance from the center of the car to the top corner = rad
        //then the angle (alpha) is the angle from the y-axis (from center of car) to top corner
        const rad = Math.hypot(this.width, this.height)/2;
        const alpha = Math.atan2(this.width, this.height);

        //imagine a unit circle, with 0-degrees pointing up (on y-axis)
        //   i.e. rotated 90 degrees CCW.
        //angle theta starts increasing (from 0-degrees) in quadrant 2.
        //imagine a line to the a point (x,y) in second quadrant, forming angle with y-axis
        //cos(angle) = distance on y-axis
        //sin(angle) = distance on x-axis
        //(x,y) for ponint on this unit circle = ( sin(angle), cos(angle) )

        //NOTE:  we also need to adjust all angles relative to the car's angle (this.angle)
        //NOTE: in our game's coordinate system:  
        //   y-values get smaller as you go UP, and larger as you go DOWN (flipped with traditional x-y coord system)
        //   x-values get smaller as you move left (as expected)

        //top right corner is in quadrant 1
        //alpha angle in quadrant 1 would be (-alpha)
        //(x,y) on unit circle = (sin(-alpha)), cos(-alpha)) = (-a, +b)
        //   x = -a = some negative value
        //   y = +b = some positive value
        //Now let's calculate the actual (x,y) of the top right corner:  
        //  x = this.x - (-a) = this.x + a = move right
        //  y = thix.y - (b)  = this.y - b = move up  (remember that y values get smaller as we move UP the screen)
         points.push({
            x:this.x - Math.sin(this.angle - alpha) * rad,
            y:this.y - Math.cos(this.angle - alpha) * rad
        });
        
        //top left corner is in quadrant 2
        //alpha angle in quadrant 2 would be +alpha
        //(x,y) on unit circle = (sin(alpha)), cos(alpha)) = (+a, +b)
        //   x = +a = some positive value
        //   y = +b = some positive value
        //Now let's calculate the actual (x,y) of the top left corner:  
        //  x = this.x - (a) = this.x - a = move left
        //  y = thix.y - (b) = this.y - b = move up  (remember that y values get smaller as we move UP the screen)
        points.push({
            x:this.x - Math.sin(this.angle + alpha) * rad,
            y:this.y - Math.cos(this.angle + alpha) * rad
        });
        
        //bottom left corner is in quadrant 3
        //alpha angle in quadrant 3 would be (Math.PI-alpha)
        //(x,y) on unit circle = (sin(Math.PI-alpha)), cos(Math.PI-alpha)) = (+a, -b)
        //   x = +a = some positive value
        //   y = -b = some negative value
        //Now let's calculate the actual (x,y) of the bottom left corner:  
        //  x = this.x - (+a) = this.x - a = move left
        //  y = thix.y - (-b) = this.y + b = move down (y values get larger as you move DOWN the screen)
        points.push({
            x:this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y:this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });

        //bottom right corner is in quadrant 4
        //alpha angle in quadrant 4 would be (Math.PI+alpha)
        //(x,y) on unit circle = (sin(Math.PI+alpha)), cos(Math.PI+alpha)) = (-a, -b)
        //   x = -a = some negative value
        //   y = -b = some negative value
        //Now let's calculate the actual (x,y) of the bottom right corner:  
        //  x = this.x - (-a) = this.x + a = move right
        //  y = thix.y - (-b) = this.y + b = move down
        points.push({
            x:this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y:this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });

        return points;


    }

    draw(ctx){
        if(this.damaged){
            ctx.fillStyle = "gray";
        }
        else{
            ctx.fillStyle = "black";
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);

        for (let i=1; i<this.polygon.length; i++){
            //Consecutive lineTo() calls continue from the endpoint of the previous segment
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }

        //close sub-paths (from point 3 to point 0)
        ctx.closePath();

        //implicitly closes any open sub-paths before filling in
        ctx.fill();

        this.sensor.draw(ctx);
    }
}