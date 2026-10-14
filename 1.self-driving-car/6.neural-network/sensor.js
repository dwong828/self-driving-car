class Sensor{
    constructor(car){
        this.car = car;
        this.rayCount = 5;
        this.rayLength = 150;
        this.raySpread = Math.PI/2;

        this.rays=[];
        //array of closest intersection points to each ray
        //each element has this structure {x, y, offset}
        this.readings=[];
    }


    //get closest intersections for all rays and store them in
    //this.readings array
    update(roadBorders, traffic){
        this.#castRays();
        this.readings=[];
        for (let i=0; i<this.rays.length; i++){
            this.readings.push(
                this.#getReadings(
                    this.rays[i], 
                    roadBorders, 
                    traffic
                )
            );
        }
    }

    //get closest intersection of one ray
    //returns offset to closest intersection with road/traffic
    //returns null if no intersection with road/traffic
    #getReadings(ray, roadBorders, traffic){
        let touches=[];

        //check if sensor ray intersects with road borders
        for (let i=0; i<roadBorders.length; i++){
            const touch =  getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );

            if(touch){
                touches.push(touch);
            }
        }

        //check if sensor ray intersects with traffic
        for (let i=0; i<traffic.length; i++){
            const poly = traffic[i].polygon;
            for (let j=0; j<poly.length; j++){
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length]
                );
                if (value){
                    touches.push(value);
                }
            }
        }

        if (touches.length == 0){
            return null;
        }
        //get closest ray intersection to car
        else{
            //get an array with only the offsets
            //the touches structure has {x, y, offset}. we only want the offsets
            const offsets=touches.map(e=>e.offset);

            //get smallest offset.  Need to spread array into individual elements
            const minOffset = Math.min(...offsets);

            //find the touch that has this minimum offset
            return touches.find(e=>e.offset == minOffset);
        }
    }

    //cast the yellow rays from the car
    #castRays(){
        this.rays=[];
        for (let i=0; i<this.rayCount; i++){
            //this is based on a unit circle, where 0-degrees is pointing up
            //positive angle to the left, negative angle to the right of the unit circle
            const rayAngle = lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount==1 ? 0.5 : i/(this.rayCount-1)  //handle a single raycount
            ) + this.car.angle; //add this.car.angle so the rays are relative to position of car!

            const start={x:this.car.x, y:this.car.y};

            //given the unit circle, with 0-degrees pointing up, then:
            //sin(angle) = x coord
            //cos(angle) = y coord
            const end={
                x:this.car.x - Math.sin(rayAngle) * this.rayLength,
                y:this.car.y - Math.cos(rayAngle) * this.rayLength
            };

            //push a new segment array to the rays array
            this.rays.push([start, end]);
        }
    }

    draw (ctx){
        for (let i=0; i<this.rayCount; i++){
            let end=this.rays[i][1];

            //check if the ray intersects with borders
            if(this.readings[i]){
                end=this.readings[i];
            }

            //drawy yellow ray from car to intersection (if any)
            //otherwise, to end of ray
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            //draw black ray from intersection (if any) to end of ray
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="black";
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }
}