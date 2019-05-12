var oneIn = require('./opts.rnd');
var utils = require('./opts.utils');
var constructionUtils = require('./planner.utils');

function buildExtensions(room, maximumSites, maximumExtensions, radius) {
    utils.logInform("Checking extention constructions in " + room);

    let existingSites = room.find(FIND_CONSTRUCTION_SITES).filter(function(site) {
        return site.structureType == STRUCTURE_EXTENSION;
    }).length; 

    let existingExtensions = room.find(FIND_STRUCTURES).filter(function(structure) {
        return structure.structureType == STRUCTURE_EXTENSION;
    }).length;

    if(existingSites >= maximumSites || existingExtensions >= maximumExtensions)
        return;

    let spawns = room.find(FIND_MY_SPAWNS);
    if(spawns.length == 0){
        console.log("No spawn found to build extention");
        return;
    }

    utils.logInform("Constructing extentions in " + room);

    //let positions = getSuitablePositions(room, radius);

    let positions = getSuitablePositions(room, radius);

    if(positions.length == 0){
        console.log("Found no suitable positions for extensions");
        return;
    }

    //utils.shuffle(positions);

    while(existingSites < maximumSites && existingExtensions < maximumExtensions && positions.length > 0){
        const pos = JSON.parse(positions[0][0]);
        positions.shift();
        const rpos = new RoomPosition(pos.x, pos.y, pos.roomName)
        console.log("actually constructing the extension")
        console.log(rpos)
        let result = rpos.createConstructionSite(STRUCTURE_EXTENSION);
        if(result == 0){
            existingSites++;
            existingExtensions++
        }
        else{
            console.log("extension building failed: " + result);
            break; // Test
        }
    }
}

// This should be possible with the utils function "near spawn"
function getSuitablePositions(room, searchRadius){
    console.log("[Expensive] Running getSuitablePositions");

    //get Spawn
    let spawns = room.find(FIND_MY_SPAWNS);
    if(spawns.length != 1){
        console.log("One spawn per room is allowed");
        return;
    }

    let center = spawns[0].pos;
    let terrain = room.getTerrain();

    let scored = {};

    for(let x = -searchRadius; x < searchRadius; x++){
        for(let y = -searchRadius; y < searchRadius; y++){
            if(!utils.isInMap(center.x + x, center.y + y, 3))
                continue;

            let pos = new RoomPosition(center.x + x, center.y + y, room.name);

            let spawnDistance = utils.distance(pos, center);
            if(spawnDistance > searchRadius)
                continue;

            if(room.memory.nobuild[JSON.stringify({x: pos.x, y: pos.y})] == undefined 
                && utils.isWalkable(pos)){ // && constructionUtils.isReachable(room, pos)
                
                //let numRoads = 0;
                //let radius = 6;
                //for(let ox = -radius / 2; ox < radius / 2; ox++)
                //    for(let oy = -radius / 2; oy < radius / 2; oy++)
                //        numRoads += (room.memory.nobuild[JSON.stringify({x: pos.x + ox, y: pos.y + oy})] == undefined ? 0 : 1); // use plannerUtils.mayBuild

                //let numWalls = 
                //    (terrain.get(pos.x + 1, pos.y + 0) == TERRAIN_MASK_WALL ? 1 : 0)
                //    + (terrain.get(pos.x - 1, pos.y + 0) == TERRAIN_MASK_WALL ? 1 : 0)
                //    + (terrain.get(pos.x + 0, pos.y + 1) == TERRAIN_MASK_WALL ? 1 : 0)
                //    + (terrain.get(pos.x + 0, pos.y - 1) == TERRAIN_MASK_WALL ? 1 : 0);

                let controllerDistance = utils.distance(pos, room.controller.pos);
                //let roomCenterDistance = utils.distance(pos, {x: 25, y:25});

                //&& (numWalls < 2 || numWalls == 3)

                if(spawnDistance > 1
                    && constructionUtils.isOnPattern(pos, center) 
                    && controllerDistance > 1){
                    scored[JSON.stringify(pos)] = 1 / spawnDistance;
                }
            }
        }
    }

    return  utils.dictToScoreSortedList(scored);
}

function draw(room){
    let poses = getSuitablePositions(room, 8);
    let i = 1;
    for(let p in poses){
        let pos = JSON.parse(poses[p][0])
        room.visual.circle(pos.x, pos.y, {fill: 'transparent', radius: 1.0/i++ * 0.3, stroke: 'orange'});
    }
}

module.exports = {
    run: function(room){
        if(oneIn(153))
            buildExtensions(room, 1, 100, 10);

        //draw(room);
    }
};
