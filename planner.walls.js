var utils = require('./opts.utils');
var oneIn = require('./opts.rnd');
var constructionUtils = require('./planner.utils');

function getCandidatesInCircle(room, center, radius){
    let scored = {};

    let terrain = room.getTerrain();

    function addIfNeedsWall(pos){
        if(!utils.isInMap(pos.x, pos.y, 0))
            return;
        
        if(constructionUtils.mayBuild(pos, room)){
            // That is a wall
            scored[JSON.stringify(pos)] = 1;
        }
        else{
            // That is a rampard
            scored[JSON.stringify(pos)] = 2;
        }
    }

    let d = 3 - (2 * radius);
    let x = 0;
    let y = radius;

    do {
        addIfNeedsWall({x: center.x + x, y: center.y + y});
        addIfNeedsWall({x: center.x + x, y: center.y - y});
        addIfNeedsWall({x: center.x - x, y: center.y + y});
        addIfNeedsWall({x: center.x - x, y: center.y - y});
        addIfNeedsWall({x: center.x + y, y: center.y + x});
        addIfNeedsWall({x: center.x + y, y: center.y - x});
        addIfNeedsWall({x: center.x - y, y: center.y + x});
        addIfNeedsWall({x: center.x - y, y: center.y - x});
        if (d < 0) {
            d = d + (4 * x) + 6;
        } else {
            d = d + 4 * (x - y) + 10;
            y--;
        }
        x++;
    } while (x <= y);

    console.log("Building walls: " + Object.keys(scored).length)

    function add(pos){
        if(utils.isInMap(pos.x, pos.y, 0) && utils.isWalkable(new RoomPosition(pos.x, pos.y, room.name))){
            if(constructionUtils.mayBuild(pos, room))
                additions[JSON.stringify(pos)] = 1; // Wall
            else
                additions[JSON.stringify(pos)] = 2; // Rampart
        }
    }
    
    let additions = {};
    
    for(let k in scored){
        let parsed = JSON.parse(k);
        
        if(additions[JSON.stringify({x: parsed.x, y: parsed.y + 1})] == undefined && (scored[JSON.stringify({x: parsed.x + 1, y: parsed.y + 1})] != undefined || scored[JSON.stringify({x: parsed.x - 1, y: parsed.y + 1})] != undefined)){
            // Unten
            add({x: parsed.x, y: parsed.y + 1});
        }
        
        else if(additions[JSON.stringify({x: parsed.x, y: parsed.y - 1})] == undefined && (scored[JSON.stringify({x: parsed.x + 1, y: parsed.y - 1})] != undefined || scored[JSON.stringify({x: parsed.x - 1, y: parsed.y - 1})] != undefined)){
            // Oben
            add({x: parsed.x, y: parsed.y - 1});
        }
    }

    for(let k in additions){
        scored[k] = additions[k];
    }
    
    let output = {};
    for(let k in scored){
        let parsed = JSON.parse(k);
        
        // This might look starge if there are already walls build
        //room.visual.circle(parsed.x, parsed.y, {fill: 'transparent', radius: 0.5, stroke: 'orange'});
        
        if(utils.isWalkable(new RoomPosition(parsed.x, parsed.y, room.name))){
            output[k] = scored[k];
        }
    }

    return  utils.dictToScoreSortedList(output);
}

function checkConstruct(room, candidates, structure){
    for(let p in candidates){
        let posParsed = JSON.parse(candidates[p][0])
        let pos = new RoomPosition(posParsed.x, posParsed.y, room.name);
       
        let structureActual = structure;
        if(structureActual == undefined) 
            structureActual = candidates[p][1] == 1 ? STRUCTURE_WALL : STRUCTURE_RAMPART;

        let result = pos.createConstructionSite(structureActual);
        if(result != 0){
            console.log("Wall building failed: " + result);
            break;
        }
    }
}

function draw(room, candidates){
    let i = 1;
    for(let p in candidates){
        let pos = JSON.parse(candidates[p][0])
        room.visual.circle(pos.x, pos.y, {fill: 'transparent', radius: 0.5, stroke: 'orange'});
    }
}

function getCandidatesAroundSpawn(room, radius){
    let spawns = room.find(FIND_MY_SPAWNS);
    if(spawns.length != 1){
        console.log("One spawn per room is allowed");
        return;
    }
 
    let center = spawns[0].pos;
    return getCandidatesInCircle(room, center, radius);
}

module.exports = {
    run: function(room) {
            //draw(room,
            //    getCandidatesAroundSpawn(room, 12)
            //);

            if(oneIn(171)){
                checkConstruct(room, getCandidatesAroundSpawn(room, 12));
            }
            
            if(oneIn(183)){
                checkConstruct(room, getCandidatesInCircle(room, room.controller.pos, 1), STRUCTURE_RAMPART);
            }

	}
};
