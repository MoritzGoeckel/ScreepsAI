var utils = require('./opts.utils');
var oneIn = require('./opts.rnd');

function placeCloseTo(room, pos, MAXIMUM){
    let existingSites = pos.findInRange(FIND_CONSTRUCTION_SITES, 10).filter(function(site) {
        return site.structureType == STRUCTURE_CONTAINER;
    }).length;

    let existingContainerClose = pos.findInRange(FIND_STRUCTURES, 10).filter(function(structure) {
        return structure.structureType == STRUCTURE_CONTAINER;
    }).length;

    if(existingContainerClose >= MAXIMUM || existingSites > 0)
        return;

    let ROOM_CENTER = 25;
    let terrain = room.getTerrain();

    let closestToCenter;
    let closestDistance = 999;
    for(let x = -2; x < 2; x++){
        for(let y = -2; y < 2; y++){
            let xx = pos.x + x;
            let yy = pos.y + y;

            if(room.memory.nobuild[JSON.stringify({x: xx, y: yy})] == undefined && terrain.get(xx, yy) != TERRAIN_MASK_WALL){
                let distance = Math.abs(xx - ROOM_CENTER) + Math.abs(yy - ROOM_CENTER);
                let pos = new RoomPosition(xx, yy, room.name);
                
                if(distance < closestDistance && pos.look().filter(s => s.type == "structure").length == 0){
                    closestToCenter = pos;
                    closestDistance = distance;
                }
            }
        }
    }

    // How about building them next to a road?
    //room.visual.circle(closestToCenter.x, closestToCenter.y, {fill: 'transparent', radius: 0.1, stroke: 'green'});

    if(closestToCenter.createConstructionSite(STRUCTURE_CONTAINER) != 0){
        console.log("Cant place container on choosen spot")
    }
}

function placeNearSpawns(room){
    let spawns = room.find(FIND_STRUCTURES).filter(function(structure) {
        return structure.structureType == STRUCTURE_SPAWN;
    });

    for(let s in spawns){
        placeCloseTo(room, spawns[s].pos, 1);
    }   
}

module.exports = {
    run: function(room) {
        if(oneIn(52))
            placeCloseTo(room, room.controller.pos, 1);

        if(oneIn(53))
            placeNearSpawns(room);
                 
        // Energy sources
        // TODO: Spawn in places where no one walks + does not block anything + Close to source of energy || Close to controller
	}
};