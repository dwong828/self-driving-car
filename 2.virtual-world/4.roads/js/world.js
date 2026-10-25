class World {
    constructor(graph, roadWidth = 100, roadRoundness = 10){
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundness = roadRoundness;

        this.envelopes = [];
        this.roadBorders = [];

        this.generate();
    }

    //create Envelopes around all of the Segments 
    generate(){
        //reset Envelopes from previous calls
        this.envelopes.length = 0;

        //create Envelopes for all Segments
        for (const seg of this.graph.segments){
            this.envelopes.push(new Envelope(
                seg, this.roadWidth, this.roadRoundness
            ));
        }

        //this contains the Polygon perimeter segments that are 
        // NOT contained within another Polyson
        this.roadBorders = Polygon.union(this.envelopes.map((e) => e.poly));

        //debug: break first 2 Polygons in the Envelope
        //Polygon.break(this.envelopes[0].poly, this.envelopes[1].poly);
    }

    draw(ctx){
        //draw the road
        for (const env of this.envelopes){
            //make the lineWidth larger than the width of the road borders (below)
            //so the roadborders are within the road
            env.draw(ctx, {fill: "#BBB", stroke: "#BBB", lineWidth: 15});
        }

        //draw the lane markers on the road with dashed lines
        for (const seg of this.graph.segments){
            seg.draw(ctx, { color: "white", width: 4,  dash: [10, 10] });
        }   

        //draw the road borders
        for (const seg of this.roadBorders){
            seg.draw(ctx, { color: "white", width: 4});
        }
    }
}