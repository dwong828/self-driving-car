class Envelope {
    constructor(skeleton, width, roundness = 1){
        this.skeleton = skeleton;  //this is a Graph Segment

        //these are the Points around the Envelope
        this.poly = this.#generatePolygon(width, roundness);
    }

    //create a Polygon with semi-circles at each end
    #generatePolygon(width, roundness){
        //get p1 and p2 from the Segment
        const { p1, p2 } = this.skeleton;

        const radius = width / 2;
        const alpha = angle(subtract(p1, p2));  //get angle between p1 and p2
        const alpha_cw = alpha + Math.PI / 2;  //get angle to point that is 90-degrees clockwise to alpha angle
        const alpha_ccw = alpha - Math.PI / 2; //get angle to point that is 90-degrees counter-clockwise to alpha angle

        //create points for semi-circle around p1
        const points = [];
        const step = Math.PI / Math.max(1, roundness); //we don't want 0 roundness
        const eps = step/2;
        //add a small value (eps) to alpha_cw to ensure floating point math includes this final value
        for (let i=alpha_ccw; i<=alpha_cw + eps; i+=step){
            points.push(translate(p1, i, radius));
        }

        //create points for semi-circle around p2
        //p2 is upside down, so offset by Math.PI
        for (let i=alpha_ccw; i<=alpha_cw + eps; i+=step){
            points.push(translate(p2, Math.PI + i, radius));
        }

        //new Polygon with points (top left, top right, bottom right, bottom left)
        return new Polygon(points);
    }

    //draw the roads
    draw(ctx, options){
        //this draws the road
        this.poly.draw(ctx, options);

        //debug: this draws the road borders separately
        //this.poly.drawSegments(ctx);
    }
}