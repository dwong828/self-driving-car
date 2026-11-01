class Building {
    constructor(poly, height = 200){
        //this.base = (top left, top right, bottom right, bottom left)
        this.base = poly;
        this.height = height;
    }

    draw(ctx, viewPoint){
        // calculate points for base of roof (60%) depending on how far
        // the builing is from the center of the screen
        // this is the same calculation as the tree tops
        const topPoints = this.base.points.map((p) =>
            getFake3dPoint(p, viewPoint, this.height * 0.6)
        );       
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

        const baseMidpoints = [
            average(this.base.points[0], this.base.points[1]),  //top line of base
            average(this.base.points[2], this.base.points[3])   //bottom line of base
        ];

        //this is the top of the roof (get rid of 60% factor on heightCoef)
        const topMidpoints = baseMidpoints.map((p) =>
            getFake3dPoint(p, viewPoint, this.height)
        );

        const roofPolys = [
            //Poly = [topMidBack, topMidFront, bottomLeftCeiling, topLeftCeiling]
            new Polygon([topMidpoints[0], topMidpoints[1], ceiling.points[3], ceiling.points[0]]),
            //Poly = [topMidBack, topMidFront, bottomRightCeiling, topRightCeiling]
            new Polygon([topMidpoints[0], topMidpoints[1], ceiling.points[2], ceiling.points[1]]),
        ];
        //sort farther roof Polys before closer roof Polys so they will be drawn first
        //and closer roof Polys will be drawn over the farther ones
        roofPolys.sort(
            (a,b) => b.distanceToPoint(viewPoint) - a.distanceToPoint(viewPoint)
        );


        //draw base with wider lineWidth, so we can see a shadow under each Building
        this.base.draw(ctx, { fill: "white", stroke: "rgba(0,0,0,0.2)", lineWidth: 20});
        
        //draw sides
        for (const side of sides){
            side.draw(ctx, { fill: "white", stroke: "#AAA"});
        }

        //draw flat ceiling
        ceiling.draw(ctx, { fill: "white", stroke: "white", lineWidth: 6});

        //draw trangular roof
        for (const roof of roofPolys){
            roof.draw(ctx, { fill: "#D44", stroke: "#C44", lineWidth: 8, join: "round"});
        }
    }
}