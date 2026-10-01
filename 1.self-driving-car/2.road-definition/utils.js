/*
    Get value between A and B (inclusive) based on t percentage
    A = start value
    B = end value
    t = value between 0 and 1 (percentage)
*/
function lerp(A, B, t){
    return A + (B-A)*t;
}