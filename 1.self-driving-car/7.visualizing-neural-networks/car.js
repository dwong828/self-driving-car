class Car{
    constructor(x, y, width, height, controlType, maxSpeed=3){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        this.speed=0;
        this.acceleration=0.2;
        this.maxSpeed = maxSpeed;
        this.friction=0.05;
        this.angle=0;
        this.damaged = false;

        this.useBrain = controlType=="AI";

        //only show sensors for player car, not traffic cars
        if(controlType != "DUMMY"){
            this.sensor=new Sensor(this);
            //input neurons = number of rays
            //6 neurons in internal layer
            //4 output neurons (forward, left, right, reverse)
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 4]
            );
        }
        this.controls=new Controls(controlType);
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

    update(roadBorders, traffic){
        if (!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders, traffic);

            //use 1 - s.offset so that:
            //we get a value close to 1 if the intersection is closer
            //we get a value close to 0 if the intersection is farther
            const offsets = this.sensor.readings.map(
                s=>s==null? 0 : 1 - s.offset
            );

            //get output layer from our neural network brain
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            //debug - show value of output nodes array
            //console.log(outputs);

            //hook up the outputs from neural network to the car's controls
            if (this.useBrain){
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }

        }
    }

    //check if car intersects with road borders
    #assessDamage(roadBorders, traffic){
        for (let i=0; i<roadBorders.length; i++){
            //arg1 is our car polygon with car's 4 corners: [(x,y), (x,y), (x,y), (x,y)] 
            //arg2 is EACH road border: [(x,y), (x,y)]
            if (polysIntersect(this.polygon, roadBorders[i])){
                return true;
            }
        }

        for (let i=0; i<traffic.length; i++){
            if(polysIntersect(this.polygon, traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }

    //create border of car, identified by the car's 4 corners
    #createPolygon(){
        //store 4 corners of the car (topRight, topLeft, botLeft, botRight)
        //points = [(x,y), (x,y), (x,y), (x,y)]
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

    draw(ctx, color){
        if(this.damaged){
            ctx.fillStyle = "gray";
        }
        else{
            ctx.fillStyle = color;
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

        if(this.sensor){
            this.sensor.draw(ctx);
        }
    }
}