class Point {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    equals(point){
        return this.x == point.x && this.y == point.y;
    }

    draw (ctx, {size = 18, color = "black", outline=false, fill=false} = {}){
        const rad = size / 2;
        ctx.beginPath();
        ctx.fillStyle = color;
        //draw a circle at (x,y) with radius=rad
        ctx.arc(this.x, this.y, rad, 0, Math.PI * 2);
        ctx.fill();

        //draw a yellow outline inside of the point to show that it is selected by mouse
        if (outline){
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.arc(this.x, this.y, rad * 0.6, 0, Math.PI * 2);
            ctx.stroke();
        }

        //draw a smaller fill inside the point to show it is hovered by mouse
        if (fill){
            ctx.beginPath();
            ctx.arc(this.x, this.y, rad * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = "yellow";
            ctx.fill();

        }
    }
}