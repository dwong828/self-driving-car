class Building {
    constructor(poly, heightCoef = 0.4){
        this.base = poly;
        this.heightCoef = heightCoef;
    }

    draw(ctx, viewPoint){
        // calculate points roof of buildings depending on how far
        // the builing is from the center of the screen
        // this is the same calculation as the tree tops
        const topPoints = this.base.points.map((p) => {
            const diff = subtract(p, viewPoint);       
            return add(p, scale(diff, this.heightCoef));
        });       
        //generate Polygon for roof of building
        const ceiling = new Polygon(topPoints);

        //generate Polygons for sides of building
        const sides = [];
        for (let i=0; i<this.base.points.length; i++){
            const nextI = (i+1) % this.base.points.length; //loop around

            //create poly with points in this order:
            //bottom left (base), bottom right(base), top right, top left
            const poly = new Polygon([
                this.base.points[i], this.base.points[nextI],
                topPoints[nextI], topPoints[i]
            ]);
            sides.push(poly);
        }

        //reverse sort the sides so that the sides that are farther from the center of the screen
        //come before the sides that are closer to the center
        //otherwise, when we draw the sides of the building, we may see the "inner" walls
        sides.sort(
            (a,b) => b.distanceToPoint(viewPoint) - a.distanceToPoint(viewPoint)
        );

        //draw base
        this.base.draw(ctx, { fill: "white", stroke: "#AAA"});
        
        //draw sides
        for (const side of sides){
            side.draw(ctx, { fill: "white", stroke: "#AAA"});
        }

        //draw ceiling
        ceiling.draw(ctx, { fill: "white", stroke: "#AAA"});
    }
}