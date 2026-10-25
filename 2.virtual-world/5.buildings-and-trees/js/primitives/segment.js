class Segment {
    constructor(p1, p2){
        this.p1 = p1;
        this.p2 = p2;
    }

    //get length of segment
    length(){
        return distance(this.p1, this.p2);
    }

    //get a vector from p2 to p1 with magnitude 1
    //we only care about the direction from p2 to p1
    directionVector(){
        return normalize(subtract(this.p2, this.p1));
    }


    //check if segments are equal by checking if they contain the same 2 points
    equals(segment){
        return this.includes(segment.p1) && this.includes(segment.p2);
    }

    //check if a segment includes a point, in any order (in either p1 or p2)
    includes(point){
        return this.p1.equals(point) || this.p2.equals(point);
    }

    //return distance between a Segment and a Point
    distanceToPoint(point) {
        const proj = this.projectPoint(point);
        if (proj.offset > 0 && proj.offset < 1) {
            return distance(point, proj.point);
        }
        const distToP1 = distance(point, this.p1);
        const distToP2 = distance(point, this.p2);
        return Math.min(distToP1, distToP2);
   }

   //project a point onto the Segment
   //i.e. where it would create a 90-degree angle
   projectPoint(point) {
        const a = subtract(point, this.p1);
        const b = subtract(this.p2, this.p1);
        const normB = normalize(b);
        const scaler = dot(a, normB);
        const proj = {
            point: add(this.p1, scale(normB, scaler)),
            offset: scaler / magnitude(b),
        };
        return proj;
   }

    draw(ctx, { width = 2, color = "black", dash = [] } = {}){
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.setLineDash(dash)
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();

        //reset dash so it doesn't affect subsequent drawings
        ctx.setLineDash([])
    }
}