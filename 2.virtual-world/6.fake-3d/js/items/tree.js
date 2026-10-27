class Tree {
    constructor(center, size, height = 200){
        this.center = center; //center Point
        this.size = size;  //size of the tree base
        this.height = height;  //height of tree
        this.base = this.#generateLevel(center, size); //store base of tree to check for car collosions
    }

    #generateLevel(point, size){
        const points = [];
        const rad = size / 2;

        for (let a=0; a < Math.PI * 2; a += Math.PI/16){

            //get a pseudo random number between (0,1);
            //can't use Math.random() since it will generate a new random number every iteration
            //and the tress will never stop spinning
            //this "kindOfRandom" number does not change unless the map is zoomed/dragged
            const kindOfRandom = Math.cos(((a + this.center.x) * size) % 17) **2;

            //offset radius by a random number between (0.5, 1)
            const noisyRadius = rad * lerp(0.5, 1, kindOfRandom);

            //generate a jagged circle
            points.push(translate(point, a, noisyRadius));
        }
        return new Polygon(points);
    }


    //viewPoint: a Point at the center of the screen
    draw(ctx, viewPoint){

        
        //Normalized direction of tree between (0, 1)
        const dir = normalize(subtract(this.center, viewPoint));

        //calculate scaler based on distance of tree from center of screen
        const dist = distance(this.center, viewPoint);
        //atan() returns a value between 0 and PI/2
        //so, we divide by PI/2 to get a value between (0, 1)
        //and divide the distance by 300 so the trees don't flip really fast when panning
        const scaler = Math.atan(dist / 300) / (Math.PI / 2);  //value between (0, 1)

        //The height of the tree is proportional to the 
        //distance of tree from center of screen (taller if farther from center of screen)
        const top = add(this.center, scale(dir, this.height * scaler));

        const levelCount = 7;
        //draw tree.  
        // level 0 = base;  level (levelCount-1) = top
        for (let level=0; level<levelCount; level++){
            const t = level / (levelCount - 1);

            //get adjusted center of each level of the tree
            const point = lerp2D(this.center, top, t);

            //make each level of the tree a lighter shade of green
            const color = "rgb(30," + lerp(50, 200, t) + ",70)";

            //make each level of the tree smaller so it looks like a pyramid
            const size = lerp(this.size, 40, t);

            //draw a jagged shape for each tree level, rather than a circle
            const poly = this.#generateLevel(point, size);
            poly.draw(ctx, { fill: color, stroke: "rgba(0,0,0,0)" });

            //debug:  draw each level of the tree as a circle
            //point.draw(ctx, { size: size, color: color});
        }

        //debug: draw the trunk of the tree
        //new Segment(this.center, top).draw(ctx);

    }
}