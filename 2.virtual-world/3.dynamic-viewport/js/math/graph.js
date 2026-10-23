class Graph {
    constructor(points = [], segments=[]){
        this.points = points;
        this.segments = segments;
    }

    //create a new graph from the "info" loaded from local storage
    static load(info){
        //create the Points array from the input data
        const points = info.points.map((i) => new Point(i.x, i.y));

        //create the Segments array from the input data
        //note: need to find the actual Points from the points array to create the Segments
        //can't just use the (segInfo.p1, segInfo.p2) to create the Segments, else the 
        //Segments will not be attached to the actual Points (and dragging Points will
        // leave unattached Segments)
        const segments = info.segments.map((i) => new Segment(
            points.find((p) => p.equals(i.p1)),
            points.find((p) => p.equals(i.p2))
        ));

        return new Graph(points, segments);
    }

    //add a point to the graph
    addPoint(point){
        this.points.push(point);    
    }

    //check if graph contains a point
    containsPoint(point){
        return this.points.find(p => p.equals(point));
    }

    //add a point if it only if the graph does not already contain it
    tryAddPoint(point){
        if(!this.containsPoint(point)){
            this.addPoint(point);
            return true;
        }
        return false;
    }

    //remove a point from the graph, and any attached segments
    removePoint(point){
        //remove all segments attached to this point
        const segs = this.getSegmentsWithPoint(point);
        for (const seg of segs){
            this.removeSegment(seg);
        }
        //remove the point
        this.points.splice(this.points.indexOf(point), 1);
    }

    //add a segment to the graph
    addSegment(seg){
        this.segments.push(seg);
    }

    containsSegment(seg){
        return this.segments.find(s => s.equals(seg));
    }
    
    //add a segment to the graph only if the graph does not already contain it
    tryAddSegment(seg){
        if(!this.containsSegment(seg) && !seg.p1.equals(seg.p2)){
            this.addSegment(seg);
            return true;
        }
        return false;
    }

    //remove a segment from the graph
    removeSegment(seg){
        this.segments.splice(this.segments.indexOf(seg), 1);
    }

    //get all segments that are connected to a point
    getSegmentsWithPoint(point){
        const segs = [];
        for (const seg of this.segments){
            if (seg.includes(point)){
                segs.push(seg);
            }
        }
        return segs;
    }
    
    //remove all points and segments in the graph
    dispose(){
        this.points.length = 0;
        this.segments.length = 0;

    }
    
    draw(ctx){
        for (const seg of this.segments){
            seg.draw(ctx);
        }

        for (const point of this.points){
            point.draw(ctx);
        }
    }
}