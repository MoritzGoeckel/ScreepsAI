var _ = require('lodash');
var utils = require('./opts.utils');
var oneIn = require('./opts.rnd');

function drawPath(room, path){
    path.map(
        p => room.visual.circle(p.x, p.y, {fill: 'yellow', radius: 0.5, stroke: 'yellow'})
    );
}

function toPosArray(path){
    return path.map(
        p => {return {x: p.x, y: p.y}}
    );
}

function draw(room){
    if(room.memory.nobuild == undefined)
        return;

    Object.keys(room.memory.nobuild).map(p => {
        let parsed = JSON.parse(p);
        let score = room.memory.nobuild[p] + 1;
        room.visual.rect(parsed.x - 0.3, parsed.y - 0.3, 0.6, 0.6, {fill: 'transparent', stroke: 'red'});
    });
}

function calculateNoBuilds(room){
    if(room.controller == undefined){
        console.log("[BUG] room.controller is undefined! WTF? ##############")
        return;
    }

    let spawns = room.find(FIND_MY_SPAWNS).map(s => s.pos);

    if(spawns.length == 0)
        return;

    let sources = room.find(FIND_SOURCES).map(s => s.pos);
    let exits_v2 = [room.find(FIND_EXIT_TOP), room.find(FIND_EXIT_RIGHT), room.find(FIND_EXIT_BOTTOM), room.find(FIND_EXIT_LEFT)]
        .map(arr => arr[Math.floor(arr.length / 2)])
        .filter(pos => pos != null);

    let exits = [
        room.controller.pos.findClosestByPath(FIND_EXIT_TOP),
        room.controller.pos.findClosestByPath(FIND_EXIT_RIGHT),
        room.controller.pos.findClosestByPath(FIND_EXIT_BOTTOM),
        room.controller.pos.findClosestByPath(FIND_EXIT_LEFT)
    ].filter(pos => pos != null);

    let controller = room.controller.pos;

    let importantPoints = sources.concat(exits, controller, exits_v2); //Spawns
    
    let points = [];

    for(let s in spawns){
        for(let i in importantPoints){
            let path = room.findPath(spawns[s], importantPoints[i], {ignoreDestructibleStructures: true, ignoreCreeps: true, ignoreRoads: true});
            points = points.concat(toPosArray(path).filter(p => { return p.x != importantPoints[i].x || p.y != importantPoints[i].y; }));
        }
        for(let s in sources){
            let path = room.findPath(controller, sources[s], {ignoreDestructibleStructures: true, ignoreCreeps: true, ignoreRoads: true});
            points = points.concat(toPosArray(path).filter(p => { return p.x != sources[s].x || p.y != sources[s].y; }));
        }
    }

    // Remove douplicates
    points = points.map(p => JSON.stringify(p));
    points = _.uniq(points);
    points = points.map(p => JSON.parse(p));

     points.map(p => room.visual.circle(p.x, p.y, {fill: 'yellow', radius: 0.5, stroke: 'yellow'}));

    if(room.memory.nobuild == undefined || Object.keys(room.memory.nobuild).length == 0 || Object.keys(room.memory.nobuild).length > points.length){
        let dict = {};
        points.map(p => { dict[JSON.stringify(p)] = 0 });
        room.memory.nobuild = dict;
        console.log("Found less no build solution: Replacing roads. Before: " + Object.keys(room.memory.nobuild).length + " After: " + points.length);
    }
}

module.exports = {
    run: function(room) {
        if(room.memory.nobuild == undefined || Object.keys(room.memory.nobuild).length == 0)
            calculateNoBuilds(room);

        //draw(room);
	}
};
