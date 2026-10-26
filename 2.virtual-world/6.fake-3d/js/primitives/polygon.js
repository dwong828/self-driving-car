class Polygon {
    constructor(points){
        this.points = points;

        //create Segments between all the Points around the Polygon
        //i.e. the Segments around the outline of the Envelope
        this.segments = [];
        for (let i=1; i<=points.length; i++){
            this.segments.push(new Segment(
                points[i-1],
                points[i % points.length]
            ));
        }
    }

    //create the overall shape of the roads by deleting Segments
    //that are contained within another Envelope
    //polys:  array of polygons
    static union(polys){
        Polygon.multiBreak(polys);
        const keptSegments = [];
        for (let i=0; i<polys.length; i++){
            //loop through all the segment borders of each polygon..
            for (const seg of polys[i].segments){
                let keep = true;
                //and check if this segment is contained inside of another polygon
                for (let j=0; j<polys.length; j++){
                    //don't check against the same polygon
                    if (i != j){
                        if (polys[j].containsSegment(seg)){
                            keep = false;
                            break;
                        }
                    }
                }
                if (keep){
                    keptSegments.push(seg);
                }
            }
        }
        return keptSegments;
    }


    //break the outline of an array of polygons/roads
    static multiBreak(polys){
        for (let i=0; i<polys.length - 1; i++){
            for (let j=i+1; j<polys.length; j++){
                Polygon.break(polys[i], polys[j]);
            }
        }
    }

    //find intersection points and break the outline of 2 polygons/roads
    static break(poly1, poly2){
        const segs1 = poly1.segments;
        const segs2 = poly2.segments;
        for (let i=0; i<segs1.length; i++){
            for (let j=0; j<segs2.length; j++){
                const int = getIntersection(
                    segs1[i].p1, segs1[i].p2, segs2[j].p1, segs2[j].p2
                );

                //find intersections that are NOT at a single point 
                //(e.g tips of polygons)
                if (int && int.offset != 1 && int.offset != 0){
                    const point = new Point(int.x, int.y);

                    //now let's split the segments into 2 parts
                    //part 1:  p1 -> intersection point
                    //part 2:  intersection point -> p2

                    //split segs1
                    let aux = segs1[i].p2;
                    //set the new endpoint for part 1 of the segment
                    segs1[i].p2 = point;
                    //add a new segment for part 2
                    //splice() with 0 as the second arg means don't delete anything
                    segs1.splice(i+1, 0, new Segment(point, aux));

                    //split segs2
                    aux = segs2[j].p2;
                    //set the new endpoint for part 1 of the segment
                    segs2[j].p2 = point;
                    //add a new segment for part 2
                    segs2.splice(j+1, 0, new Segment(point, aux));


                }
            }
        }
    }

    //get distance from the Polygon to a Point
    distanceToPoint(point){
        return Math.min(...this.segments.map((s) => s.distanceToPoint(point)));
    }

    //get distance between two Polygons
    distanceToPoly(poly){
        return Math.min(...this.points.map((p) => poly.distanceToPoint(p)));

    }

    //check if 2 polys intersect
    intersectsPoly(poly){
        for (let s1 of this.segments){
            for (let s2 of poly.segments){
                if (getIntersection(s1.p1, s1.p2, s2.p1, s2.p2)){
                    return true;
                }
            }
        }
        return false;
    }

    //check if the midpoint of a segment is contained within a Polygon
    containsSegment(seg){
        const midpoint = average(seg.p1, seg.p2);
        return this.containsPoint(midpoint);
    }

    //check if a Point is inside a Polygon
    //Set an imaginary Point (OUT) really far away at (-1000, 1000)
    //count how many times the line from OUT to the point argument intersects the Polygon perimeter
    //even number of intersections:  means the point is outside the Polygon (goes in, goes out; multiple of 2)
    //odd number of intersections: means the point is inside the Polygon
    containsPoint(point){
        const outerPoint = new Point(-1000, -1000);
        let intersectionCount = 0;
        for (const seg of this.segments){
            let foundIntersection = getIntersection(outerPoint, point, seg.p1, seg.p2);
            if (foundIntersection){
                intersectionCount++;
            }
        }
        //if odd number of intersections, then the point is inside the Polygon
        return intersectionCount % 2 == 1;
    }

    //debug: draw the road borders with random colors (for debugging intersections)
    drawSegments(ctx){
        for (const seg of this.segments){
            seg.draw(ctx, { color: getRandomColor(), width: 5 });
        }

    }

    //draw the polygon (road, building, tree)
    draw(ctx, { stroke="blue", lineWidth=2, fill="rgba(0,0,255,0.3)"} = {}){
        ctx.beginPath();
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i=1; i<this.points.length; i++){
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        //draw line to the first point
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

}