/*
    Get value between A and B (inclusive) based on t percentage
    A = start value
    B = end value
    t = value between 0 and 1 (percentage)
*/
function lerp(A, B, t){
    return A + (B-A)*t;
}

//check if line segment AB intersects with line segment CD
function getIntersection(A,B,C,D){ 
    const tTop=(D.x-C.x)*(A.y-C.y)-(D.y-C.y)*(A.x-C.x);
    const uTop=(C.y-A.y)*(A.x-B.x)-(C.x-A.x)*(A.y-B.y);
    const bottom=(D.y-C.y)*(B.x-A.x)-(D.x-C.x)*(B.y-A.y);
    
    if(bottom!=0){
        const t=tTop/bottom;
        const u=uTop/bottom;
        if(t>=0 && t<=1 && u>=0 && u<=1){
            return {
                x:lerp(A.x,B.x,t),
                y:lerp(A.y,B.y,t),
                offset:t
            }
        }
    }
    return null;
}

//check if 2 polygons intersect
//poly1: array of (x,y) points
//poly2: array of (x,y) points
function polysIntersect(poly1, poly2){
    for (let i=0; i<poly1.length; i++){
        for (let j=0; j<poly2.length; j++){
            //get intersection between 2 points in poly1 and 2 points in poly2
            const touch = getIntersection(
                poly1[i], 
                poly1[(i+1)%poly1.length], //wrap around and check segment (n-1, 0) 
                poly2[j],
                poly2[(j+1)%poly2.length]
            );
            if (touch){
                return true;
            }
        }
    }
    return false;
}

