class World {
    constructor(graph, 
        roadWidth = 100, 
        roadRoundness = 10,
        buildingWidth = 150,
        buildingMinLength = 150,
        spacing = 50,  //space arouund buildings
        treeSize = 160
    ){
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundness = roadRoundness;
        this.buildingWidth = buildingWidth;
        this.buildingMinLength = buildingMinLength;
        this.spacing = spacing;
        this.treeSize = treeSize;

        this.envelopes = [];
        this.roadBorders = [];
        this.buildings = [];
        this.trees = [];

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

        //generate buildings
        this.buildings = this.#generateBuildings();
        this.trees = this.#generateTrees();

    }

    #generateTrees(){
        //get list of all Points in roadBorders and Buildings
        //and find the min/max for: top, left, right, bottom
        //of the area where there are building or roads
        const points = [
            ...this.roadBorders.map((s) => [s.p1, s.p2]).flat(),
            ...this.buildings.map((b) => b.base.points).flat()
        ];
        const left = Math.min(...points.map((p) => p.x));
        const right = Math.max(...points.map((p) => p.x));
        const top = Math.min(...points.map((p) => p.y));
        const bottom = Math.max(...points.map((p) => p.y));

        //we don't want trees to be placed on buildings or roads
        const illegalPolys = [
            ...this.buildings.map((b) => b.base),
            ...this.envelopes.map((e) => e.poly)
        ];

        const trees = [];
        let tryCount = 0;
        //generate center of trees randomly within the
        //area where the are roads/buildings: [left, right, top, bottom]
        while (tryCount < 100){
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(top, bottom, Math.random())
            );

            //check if tree is nearby a road or building
            let keep = true;
            for (const poly of illegalPolys){
                if (poly.containsPoint(p) || poly.distanceToPoint(p) < this.treeSize/2){
                    keep = false;
                    break;
                }
            }

            //check if tree is too close to other trees
            if (keep){
                for (const tree of trees){
                    if(distance(tree.center, p) < this.treeSize){
                        keep = false;
                        break;
                    }
                }
            }

            //avoid trees in the middle of nowhere
            // only draw trees if they are close to a road or building
            //this will save our compute time
            if (keep){
                let closeToSomething = false;
                for (const poly of illegalPolys){
                    if (poly.distanceToPoint(p) < this.treeSize * 2){
                        closeToSomething = true;
                        break;
                    }
                }
                keep = closeToSomething;
            }


            if (keep){
                trees.push(new Tree(p, this.treeSize));
                tryCount = 0;
            }
            tryCount++;

        }
        return trees;
    }

    
    #generateBuildings(){
        //build a thick envelope around each graph Segment
        const tmpEnvelopes = [];
        for (const seg of this.graph.segments){
            tmpEnvelopes.push(new Envelope(
                seg,
                this.roadWidth + this.buildingWidth + this.spacing * 2,
                this.roadRoundness
            ));
        }

        //create a union of the Polygons around the graph Segments above
        //Remove Polygon Segments that are less than minimum length
        //so that we don't fit buildings next to small roads 
        const guides = Polygon.union(tmpEnvelopes.map((e) => e.poly));
        for (let i=0; i<guides.length; i++){
            const seg = guides[i];
            //if the segment is less than minimum length, then remove it
            if (seg.length() < this.buildingMinLength){
                guides.splice(i, 1);
                i--; //reduce i by 1 since we removed 1 element from array
            }
        }

        //create rectangular Building Segments along the Polygon Segments
        //space them out
        const supports = [];
        for (let seg of guides){
            const len = seg.length();
            const buildingCount = Math.floor(
                len / (this.buildingMinLength + this.spacing)
            );
            if (buildingCount == 0){
                continue;
            }
            const buildingLength = len / buildingCount - this.spacing;

            //add the first Building Segment for this Polygon Segment
            const dir = seg.directionVector();
            let q1 = seg.p1;
            let q2 = add(q1, scale(dir, buildingLength));
            supports.push(new Segment(q1, q2));

            //add the rest of the Building Segments along this Polygon Segment
            for (let i=1; i<buildingCount; i++){
                //get 2 points for the building Segment
                q1 = add(q2, scale(dir, this.spacing));
                q2 = add(q1, scale(dir, buildingLength));
                supports.push(new Segment(q1, q2));
            }
        }

        //create rectangular Building Polygons on each Building Segment
        const bases = [];
        for (const seg of supports){
            //no roundness for the Envelope creates rectangular Buildings
            bases.push(new Envelope(seg, this.buildingWidth).poly);
        }

        //remove any Buildings that intersect (usually at corners)
        const eps = 0.001;  //add this to correct for floating point math
        for (let i=0; i<bases.length-1; i++){
            for (let j=i+1; j<bases.length; j++){
                if (bases[i].intersectsPoly(bases[j]) ||
                    bases[i].distanceToPoly(bases[j]) < this.spacing - eps
                ){
                    bases.splice(j, 1); //remove bases[j] from array
                    j--;
                }
            }
        }

        return bases.map((b) => new Building(b));
    }

    draw(ctx, viewPoint){
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

        //combine trees and building into one array so that we can draw them together
        //and draw the ones that are farther from the center first
        //otherwise, the trees and buildings will overlap each other incorrectly
        const items = [...this.buildings, ...this.trees];
        items.sort((a,b) =>
            b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint)
        );


        //draw trees and buildings
        for (const item of items){
            item.draw(ctx, viewPoint);
        }
    }
}