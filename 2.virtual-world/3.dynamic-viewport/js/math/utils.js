
//Return the element in the "points" list that is closest to the point "loc"
//if it is within a threshold
//i.e. if you click within an existing point, then select it
function getNearestPoint(loc, points, threshold = Number.MAX_SAFE_INTEGER){
    let minDist = Number.MAX_SAFE_INTEGER;
    let nearest = null;
    for (const point of points){
        const dist = distance(loc, point);
        if (dist < minDist && dist < threshold){
            minDist = dist;
            nearest = point;
        }
    }
    return nearest;
}

//get distance between 2 points
function distance(p1, p2){
    return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

//add 2 points
function add(p1, p2){
    return new Point(p1.x + p2.x, p1.y + p2.y);
}

//subtract 2 points
function subtract(p1, p2){
    return new Point(p1.x - p2.x, p1.y - p2.y);
}

//multiply the Point (x,y) values by scaler
function scale(p, scaler){
    return new Point(p.x * scaler, p.y * scaler);
}