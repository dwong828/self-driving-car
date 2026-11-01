class StartEditor extends Markingditor{
    constructor (viewport, world){
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector){
        return new Start(
            center,
            directionVector,
            this.world.roadWidth / 2,  //width
            this.world.roadWidth/2     //height
        );
    }
}