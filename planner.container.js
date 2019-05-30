var utils = require('./opts.utils');
var constructionUtils = require('./planner.utils');

var oneIn = require('./opts.rnd');

// TODO: Make the container near sources low priority
// TODO: Make the container near spawn high priority
// TODO: Make the container near controller high priority
// TODO: Make the storage medium priority

function buildNearSources(room){
    let searchDistance = 1;
    
    let structureType = STRUCTURE_CONTAINER;
    
    let sources = room.find(FIND_SOURCES);
    for(let s in sources){
        let targetPosition = sources[s].pos;
        
        let existingSites = targetPosition.findInRange(FIND_CONSTRUCTION_SITES, searchDistance).filter(function(site) {
            return site.structureType == structureType;
        }).length;
    
        let existingContainerClose = targetPosition.findInRange(FIND_STRUCTURES, searchDistance).filter(function(structure) {
            return structure.structureType == structureType;
        }).length;
    
        if(existingContainerClose >= 1 || existingSites > 0)
            continue;
        
        outer: for(let x = -searchDistance; x <= searchDistance; x++){
            for(let y = -searchDistance; y <= searchDistance; y++){
                let candidate = new RoomPosition(targetPosition.x + x, targetPosition.y + y, room.name);

                if(utils.isWalkable(candidate)){
                    room.visual.circle(candidate.x, candidate.y, {fill: 'transparent', radius: 1, stroke: 'green'});
                    let result = candidate.createConstructionSite(structureType);
                    if(result != 0){
                        console.log("Cant construct: Error code = " + result + " for " + structureType);
                    } else {
                        break outer;
                    }
                }
            }
        }
    }
}

module.exports = {
    run: function(room) {

        if(oneIn(151))
            constructionUtils.checkConstruction(room, room.controller.pos, STRUCTURE_CONTAINER, 2, 8);
        
        if(oneIn(153))
            constructionUtils.checkNearSpawns(room, STRUCTURE_STORAGE, 1, 8);

        if(oneIn(155))
            constructionUtils.checkNearSpawns(room, STRUCTURE_CONTAINER, 1, 8);

        // Why do I need containers near source. 
        //If I need them, then they have to be stocked by the extracter and be blacklisted for transporter
        if(oneIn(157))
            buildNearSources(room)
	}
};