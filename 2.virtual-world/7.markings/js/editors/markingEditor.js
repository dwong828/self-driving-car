class Markingditor {
    constructor (viewport, world, targetSegments){
        this.viewport = viewport;
        this.world = world;

        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.mouse = null;

        //could point to a Stop marker (or null)
        this.intent = null;

        this.targetSegments = targetSegments;

        //array of Intents (e.g Stop markers, Crossing markers)
        this.markings = world.markings;
    }

    //to be overwritten by subclasses
    createMarking(center, directionVector){
        return center;
    }

    
    enable(){
        this.#addEventListeners();
    }

    disable(){
        this.#removeEventListeners();
    }

    #addEventListeners(){
        this.boundMouseDown = this.#handleMouseDown.bind(this);
        this.boundMouseMove = this.#handleMouseMove.bind(this);
        this.boundContextMenu = (evt) => evt.preventDefault();

        this.canvas.addEventListener("mousedown", this.boundMouseDown);
        this.canvas.addEventListener("mousemove", this.boundMouseMove);
        this.canvas.addEventListener("contextmenu", this.boundContextMenu);
    }

    #removeEventListeners(){
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
        this.canvas.removeEventListener("mousemove", this.boundMouseMove);
        this.canvas.removeEventListener("contextmenu",this.boundContextMenu);
    }

    #handleMouseMove(evt){
        //get mouse location from the viewport, because it is scaling the canvas
        this.mouse = this.viewport.getMouse(evt, true);

        //get closest Graph Segment, within a threshold, to mouse pointer
        const seg = getNearestSegment(
            this.mouse, 
            this.targetSegments, 
            10 * this.viewport.zoom
        );

        if (seg){
            //project the mouse pointer onto the closest Graph Segment
            const proj = seg.projectPoint(this.mouse);
            if (proj.offset >=0 && proj.offset <=1){
                //debug:  show the projected Point
                //this.intent = proj.point;

                //show the marker
                this.intent = this.createMarking(
                    proj.point,   //location of marker
                    seg.directionVector() //direction vector of Segment
                );
            }
            else{
                this.intent = null;
            }
        }
        else{
            this.intent = null;
        }
    }

    //on mouse down, store a Marking (if there is an intent)
    #handleMouseDown(evt){
        //left click: add a marking at the mouse location
        if (evt.button == 0){
            if (this.intent){
                this.markings.push(this.intent);
                this.intent = null; //ignore multiple clicks on same spot
            }
        }
        //right click:  remove the marking at the mouse location
        if (evt.button == 2){
            for (let i=0; i<this.markings.length; i++){
                //get the Polygon of the Marker
                const poly = this.markings[i].poly;

                //if right clicked on the polygon, then remove it
                if (poly.containsPoint(this.mouse)){
                    this.markings.splice(i, 1);
                    return;
                }
            }
        }
    }

    display(){
        if (this.intent){
            this.intent.draw(this.ctx);
        }
    }

}