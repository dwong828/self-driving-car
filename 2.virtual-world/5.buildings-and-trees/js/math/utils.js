
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

//midpoint between 2 points
function average(p1, p2){
    return new Point( (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
}

//find dot product between 2 points
function dot(p1, p2){
    return p1.x * p2.x + p1.y * p2.y;
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

//get direction of Point p, with magnitude = 1
function normalize(p){
    return scale(p, 1 / magnitude(p));
}

//distance from Point p to the origin (0,0)
function magnitude(p){
    return Math.hypot(p.x, p.y);
}

//translate a point onto a circle of "offset" radius with angle
function translate(loc, angle, offset){
    return new Point(
        loc.x + Math.cos(angle) * offset, 
        loc.y + Math.sin(angle) * offset 
    );
}

//get angle for a Point
function angle(p){
    return Math.atan2(p.y, p.x);
}

//get intersection between line AB and line CD
function getIntersection(A, B, C, D) {
   const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
   const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
   const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

   //handle floating point math where bottom is a number very close to 0, but not 0
   //so check if it's greater than 'eps' instead of checking if it's not 0
   const eps = 0.001;
   if (Math.abs(bottom) > eps) {
      const t = tTop / bottom;
      const u = uTop / bottom;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
         return {
            x: lerp(A.x, B.x, t),
            y: lerp(A.y, B.y, t),
            offset: t,
         };
      }
   }

   return null;
}

function lerp(a, b, t) {
   return a + (b - a) * t;
}

function getRandomColor(){
    const hue = 290 + Math.random() * 260;
    return "hsl(" + hue + ", 100%, 60%)";
}