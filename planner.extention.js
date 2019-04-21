var oneIn = require('./opts.rnd');
var utils = require('./opts.utils');

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

    let positions = getSuitablePositions_v2(room, radius);

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

function isInMap(x, y, border){
    return x < 50 - border && x > border && y < 50 - border && y > border;
}

/*function getSuitablePositions(room, searchRadius){
    console.log("[Expensive] Running getSuitablePositions");

    let sources = room.find(FIND_SOURCES);
    let terrain = room.getTerrain();

    let result = [];

    for(let s in sources){
        for(let x = -searchRadius / 2; x < searchRadius / 2; x++){
            for(let y = -searchRadius / 2; y < searchRadius / 2; y++){
                if(!isInMap(sources[s].pos.x + x, sources[s].pos.y + y, 7))
                    continue;

                let pos = new RoomPosition(sources[s].pos.x + x, sources[s].pos.y + y, room.name);

                if(room.memory.nobuild[JSON.stringify({x: pos.x, y: pos.y})] == undefined 
                    && terrain.get(pos.x, pos.y) != TERRAIN_MASK_WALL 
                    && pos.look().filter(s => s.type == "structure").length == 0){

                    //Next to wall
                    let numWalls = 
                      (terrain.get(pos.x + 1, pos.y + 0) == TERRAIN_MASK_WALL ? 1 : 0)
                    + (terrain.get(pos.x - 1, pos.y + 0) == TERRAIN_MASK_WALL ? 1 : 0)
                    + (terrain.get(pos.x + 0, pos.y + 1) == TERRAIN_MASK_WALL ? 1 : 0)
                    + (terrain.get(pos.x + 0, pos.y - 1) == TERRAIN_MASK_WALL ? 1 : 0);
                    
                    let numRoads = 0;
                    let radius = 6;
                    for(let ox = -radius / 2; ox < radius / 2; ox++)
                        for(let oy = -radius / 2; oy < radius / 2; oy++)
                            numRoads +=  (room.memory.nobuild[JSON.stringify({x: pos.x + ox, y: pos.y + oy})] != undefined ? 1 : 0);

                    let sourceDistance = Math.abs(pos.x - sources[s].pos.x) + Math.abs(pos.y - sources[s].pos.y);

                    if(numWalls > 0 && sourceDistance > 1 && pos.x < 45 && pos.x > 5 && pos.y < 45 && pos.y > 5 && numRoads > 0){
                        result.push(pos);
                    }
                }
            }
        }
    }

    return result;
}*/

function getSuitablePositions_v2(room, searchRadius){
    console.log("[Expensive] Running getSuitablePositions");

    let sources = room.find(FIND_SOURCES);
    let terrain = room.getTerrain();

    let scored = {};

    for(let s in sources){
        for(let x = -searchRadius / 2; x < searchRadius / 2; x++){
            for(let y = -searchRadius / 2; y < searchRadius / 2; y++){
                if(!isInMap(sources[s].pos.x + x, sources[s].pos.y + y, 7))
                    continue;

                let pos = new RoomPosition(sources[s].pos.x + x, sources[s].pos.y + y, room.name);

                if(room.memory.nobuild[JSON.stringify({x: pos.x, y: pos.y})] == undefined 
                    && terrain.get(pos.x, pos.y) != TERRAIN_MASK_WALL 
                    && pos.look().filter(s => s.type == "structure").length == 0){
                    
                    let numRoads = 0;
                    let radius = 6;
                    for(let ox = -radius / 2; ox < radius / 2; ox++)
                        for(let oy = -radius / 2; oy < radius / 2; oy++)
                            numRoads += (room.memory.nobuild[JSON.stringify({x: pos.x + ox, y: pos.y + oy})] == undefined ? 0 : 1);

                    let numWalls = 
                        (terrain.get(pos.x + 1, pos.y + 0) == TERRAIN_MASK_WALL ? 1 : 0)
                        + (terrain.get(pos.x - 1, pos.y + 0) == TERRAIN_MASK_WALL ? 1 : 0)
                        + (terrain.get(pos.x + 0, pos.y + 1) == TERRAIN_MASK_WALL ? 1 : 0)
                        + (terrain.get(pos.x + 0, pos.y - 1) == TERRAIN_MASK_WALL ? 1 : 0);

                    let sourceDistance = Math.abs(pos.x - sources[s].pos.x) + Math.abs(pos.y - sources[s].pos.y);

                    if(sourceDistance > 1 && pos.x < 45 && pos.x > 5 && pos.y < 45 && pos.y > 5 && (numWalls < 2 || numWalls == 3)
                        && ((pos.x % 3 == 0 || pos.x % 3 == 1) && (pos.y % 3 == 0 || pos.y % 3 == 1))){
                        scored[JSON.stringify(pos)] = numRoads / sourceDistance;
                    }
                }
            }
        }
    }

    return  utils.dictToScoreSortedList(scored);
}

function draw(room){
    let poses = getSuitablePositions_v2(room, 30);
    let i = 1;
    for(let p in poses){
        let pos = JSON.parse(poses[p][0])
        room.visual.circle(pos.x, pos.y, {fill: 'transparent', radius: 1.0/i++ * 0.3, stroke: 'orange'});
    }
}

module.exports = {
    run: function(room){
        if(oneIn(153))
            buildExtensions(room, 1, 50, 30);

        //draw(room);
    }
};