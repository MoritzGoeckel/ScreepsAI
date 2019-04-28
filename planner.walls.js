var utils = require('./opts.utils');
var oneIn = require('./opts.rnd');
var constructionUtils = require('./planner.utils');

function getCandidates(room, radius){
    let spawns = room.find(FIND_MY_SPAWNS);
    if(spawns.length != 1){
        console.log("One spawn per room is allowed");
        return;
    }

    let scored = {};

    let terrain = room.getTerrain();

    function addIfNeedsWall(pos){
        if(utils.isWalkable(new RoomPosition(pos.x, pos.y, room.name))){
            if(constructionUtils.mayBuild(pos, room)){
                // That is a wall
                scored[JSON.stringify(pos)] = 1;
            }
            else{
                // That is a rampard
                scored[JSON.stringify(pos)] = 2;
            }
        }
    }

    let center = spawns[0].pos;

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

    return  utils.dictToScoreSortedList(scored);
}

function checkConstruct(room, candidates){
    for(let p in candidates){
        let posParsed = JSON.parse(candidates[p][0])
        let pos = new RoomPosition(posParsed.x, posParsed.y, room.name);

        let result = pos.createConstructionSite(candidates[p][0] == 1 ? STRUCTURE_WALL : STRUCTURE_RAMPART);
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

module.exports = {
    run: function(room) {
        //draw(room,
        //    getCandidates(room, 7)
        //);

        if(oneIn(171)){
            // Thats a double wall
            checkConstruct(room, getCandidates(room, 7));
            checkConstruct(room, getCandidates(room, 8));
        }
	}
};