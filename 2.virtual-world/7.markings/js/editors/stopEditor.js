class StopEditor extends Markingditor{
    constructor (viewport, world){
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector){
        return new Stop(
            center,
            directionVector,
            this.world.roadWidth / 2,  //width
            this.world.roadWidth/2     //height
        );
    }
}