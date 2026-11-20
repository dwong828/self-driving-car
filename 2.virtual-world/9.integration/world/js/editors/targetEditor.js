class TargetEditor extends MarkingEditor{
    constructor (viewport, world){
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector){
        return new Target(
            center,
            directionVector,
            this.world.roadWidth / 2,  //width
            this.world.roadWidth/2     //height
        );
    }
}