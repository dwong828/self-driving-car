class Crossing extends Marking{
    constructor(center, directionVector, width, height){
        super(center, directionVector, width, height);
        
        //get border of the crossings (across the Road)
        this.border = [this.poly.segments[0], this.poly.segments[2]];
        this.type = "crossing";
    }

    //draw a rotated "STOP" on the road
    draw(ctx){

        //get a perpendicular line to the direction vector
        //i.e. it points across the width of the Road
        const perp = perpendicular(this.directionVector);
        const line = new Segment(
            add(this.center, scale(perp, this.width/2)),
            add(this.center, scale(perp, -this.width/2))
        )
        line.draw(ctx, {
            width: this.height,  //width of the crossings = height of the Segment
            color: "white",
            dash: [11,11]
        });

        //debug: draw the border of the crossings
        // for (const b of this.border){
        //     b.draw(ctx);
        // }

        //debug draw the polygon
        // this.poly.draw(ctx);
    }
}