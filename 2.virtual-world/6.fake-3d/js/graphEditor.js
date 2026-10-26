class GraphEditor {
    constructor(viewport, graph){
        this.viewport = viewport;
        this.canvas = viewport.canvas;
        this.graph = graph;

        this.ctx = this.canvas.getContext("2d");

        this.selected = null;  //selected point
        this.hovered = null;   //hovered point
        this.dragging = false;
        this.mouse = null;  //position of mouse 

        this.#addEventListeners();
    }

    #addEventListeners(){

        //handle left / right button clicks        
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));

        //on mouse move:
        //1. Draw a small outline on the closest point to the mouse, if it is within a threshold.
        //2. This will show the user what will happen when they click the left mouse button
        //    (i.e. will it select a point (if it has a hover outline), or will it add a new point)
        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));

        //on mouse up:
        //reset any Point dragging
        this.canvas.addEventListener("mouseup", () => {
            this.dragging = false;
        });

        //remove context menu that appears on right mouse click
        this.canvas.addEventListener("contextmenu", (evt)=>evt.preventDefault());
    }

    #handleMouseDown(evt){
        //right mouse click
        if (evt.button == 2){
            //if there is a selected point, then unselect it
            if (this.selected){
                this.selected = null;
            }
            else if (this.hovered){
                //remove the hovered point from the graph
                this.#removePoint(this.hovered);
            }
        }

        //on left mouse click, either:
        //1. Draw an outline on the closest point in the graph (if it's within threhold of mouse click); or
        //2. add a new point to the graph, if the mouseclick is outside the threshold
        if (evt.button == 0){
            //select the Point that your mouse is hovering over and clicked
            if(this.hovered){
                //if there is a Point selected already, then let's add a Segment
                //to this clicked Point
                this.#selectPoint(this.hovered);
                this.dragging = true;
                return;
            }

            //add a new point where you click with the mouse
            this.graph.addPoint(this.mouse);

            //if there is a Point selected already, then let's add a Segment
            //to this newly added Point
            this.#selectPoint(this.mouse);
            this.hovered = this.mouse;
        }
    }

    #handleMouseMove(evt){
        //get mouse location from the viewport, because it is scaling the canvas
        this.mouse = this.viewport.getMouse(evt, true);
        //get closest point, within a threshold, to mouse pointer
        //i.e. your mouse is hovering over an existing point on the graph
        this.hovered = getNearestPoint(this.mouse, this.graph.points, 10 * this.viewport.zoom);

        //if the user has clicked on a Point and is dragging it
        if (this.dragging == true){
            this.selected.x = this.mouse.x;
            this.selected.y = this.mouse.y
        }
    }

    //Add a new Segment to the selected point
    #selectPoint(point){
        if(this.selected){
            this.graph.tryAddSegment(new Segment(this.selected, point));
        }
        this.selected = point;
    }

    //remove point from graph, and reset any hovered/selected points
    #removePoint(point){
        this.graph.removePoint(point);

        this.hovered = null;

        //unselect the removed point
        if (this.selected == point){
            this.selected = null;
        }
    }

    dispose(){
        this.graph.dispose();
        this.selected = null;
        this.hovered = null;
    }

    display(){
        this.graph.draw(this.ctx);

        //draw small outline on hovered points (not clicked points)
        if(this.hovered){
            this.hovered.draw(this.ctx, {fill: true});
        }

        //draw larger outline on clicked points, and
        //draw line segments from selected point to mouse location or hovered Point location
        if(this.selected){
            //draw potential Sements that will be created on mouse click
            //if we have a hovered Point, then snap to its center vs the mouse location
            const intent = this.hovered  ? this.hovered : this.mouse;
            new Segment(this.selected, intent).draw(ctx, {dash: [3,3]}) 
                
            //draw larger outline on points that are clicked
            this.selected.draw(this.ctx, {outline: true});
        }
    }

}