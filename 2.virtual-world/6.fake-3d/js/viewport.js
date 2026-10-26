class Viewport {
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.zoom = 1;
        this.center = new Point(canvas.width/2, canvas.height/2);

        //set offset to (-canvas.width/2, -canvas.height/2) because:
        //in index.html:animate() -> we call ctx.translate() to shift everything
        //by (+canvas.width/2, +canvas.height/2) so that the zoom is relative
        //to the center of the screen, and not the top left corner (0,0)
        this.offset = scale(this.center, -1);

        this.drag = {
            start: new Point(0,0),
            end: new Point(0,0),
            offset: new Point(0,0),
            active: false
        };

        this.#addEventListeners();
    }

    //draw the viewport
    reset(){
        this.ctx.restore();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();

        //move (0,0) to the center of the screen
        //so that the zoom is relative to the center of the screen, not (0,0)
        this.ctx.translate(this.center.x, this.center.y);

        //zoom in and out with mouse wheel
        this.ctx.scale(1 / this.zoom, 1 / this.zoom);

        //pan the canvas by pressing+dragging middle mouse button
        const offset = this.getOffset();
        this.ctx.translate(offset.x, offset.y);

    }

    //get mouse location after taking account the zoom factor
    getMouse(evt, subtractDragOffset = false){
        const p =  new Point(
            (evt.offsetX - this.center.x) * this.zoom - this.offset.x,
            (evt.offsetY - this.center.y) * this.zoom - this.offset.y
        );
        return subtractDragOffset ? subtract(p, this.drag.offset) : p;
    }

    getOffset(){
        return add(this.offset, this.drag.offset);
    }

    #addEventListeners(){
        this.canvas.addEventListener("mousewheel", this.#handleMouseWheel.bind(this));
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
    }


    #handleMouseDown(evt){
        //middle button press
        if (evt.button == 1) {
            this.drag.start = this.getMouse(evt);
            this.drag.active = true;
        }
    }

    #handleMouseMove(evt){
        if (this.drag.active){
            this.drag.end = this.getMouse(evt);
            this.drag.offset = subtract(this.drag.end, this.drag.start);
        }

    }

    #handleMouseUp(evt){
        if (this.drag.active) {
            this.offset = add(this.offset, this.drag.offset);

            //reset drag
            this.drag = {
                start: new Point(0,0),
                end: new Point(0,0),
                offset: new Point(0,0),
                active: false
            };
        }
    }

    #handleMouseWheel(evt){
        //positive if mouse wheel down, negative if mouse wheel up
        const dir = Math.sign(evt.deltaY);
        const step = 0.1;
        this.zoom += dir * step;

        //keep zoom between [1,5]
        this.zoom = Math.max(1, Math.min(5, this.zoom));
    
    }
}