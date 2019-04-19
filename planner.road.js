var _ = require('lodash');
var utils = require('./opts.utils');
var oneIn = require('./opts.rnd');

function constructRoads(room, maximumSites, maximumRoads, percentThreshold){
    utils.logInform("Checking roads constructions in " + room);

    var existingSites = room.find(FIND_MY_CONSTRUCTION_SITES).filter(function(site) {
        return site.structureType == STRUCTURE_ROAD;
    }).length;

    var exisitngStructures = room.find(FIND_STRUCTURES).filter(function(site) {
        return site.structureType == STRUCTURE_ROAD;
    }).length;

    if(existingSites >= maximumSites || exisitngStructures >= maximumRoads)
        return;

    if(room.memory.roadvotes == undefined){
        room.memory.roadvotes = {};
        room.memory.roadvotesTotal = 0;
        return;
    }

    if(room.memory.roadvotesTotal < 1000){
        console.log("Road voting still in progress: " + room.memory.roadvotesTotal)
        return;
    }

    // Create items array
    var items = Object.keys(room.memory.roadvotes).map(function(key) {
        return [key, room.memory.roadvotes[key]];
    });
  
    // Sort the array based on the second element
    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    utils.logInform("Constructing roads in " + room);
    for(let p in items) {
        let parsed = JSON.parse(items[p][0]);
        //room.visual.circle(parsed.x, parsed.y, {fill: 'red', radius: 3, stroke: 'red'});

        //console.log("Total " + room.memory.roadvotesTotal)
        //console.log("Threshold " + (room.memory.roadvotesTotal * percentThreshold))
        if(items[p][1] < (room.memory.roadvotesTotal * percentThreshold)) //TODO: TOint? Threshold
            return;

        const pos = new RoomPosition(parsed.x, parsed.y, room.name);
        if(pos.createConstructionSite(STRUCTURE_ROAD) == 0){
            existingSites++;
            exisitngStructures++;
        }

        if(existingSites >= maximumSites || exisitngStructures >= maximumRoads)
            return;
    }
}

function removeConstructionsSites(room){
    room.find(FIND_MY_CONSTRUCTION_SITES).filter(function(site) {
        return site.structureType == STRUCTURE_ROAD;
    }).map(site => site.remove());
}

function removeRoadsOff(room){
    room.find(FIND_STRUCTURES, {
        filter: { structureType: STRUCTURE_ROAD }
    }).filter(strucutre => {
        return room.memory.roadvotes[JSON.stringify({x: strucutre.pos.x, y: strucutre.pos.y})] == undefined;
    })
    .map(strucutre => {
        //room.visual.circle(strucutre.pos.x, strucutre.pos.y, {fill: 'red', radius: 0.3, stroke: 'red'});
        strucutre.destroy();
    });
}

function resetVotes(room){
    Object.keys(room.memory.roadvotes).map(raw => {
        room.memory.roadvotes[raw] = 0;
        room.memory.roadvotesTotal = 0;
    });
}

function draw(room, threshold){
    if(room.memory.roadvotesTotal == undefined)
        return;

    let total = room.memory.roadvotesTotal;

    Object.keys(room.memory.roadvotes).map(p => {
        let parsed = JSON.parse(p);
        let votes = room.memory.roadvotes[p];
        let ratio = votes / total;
        if(ratio > threshold)
            room.visual.circle(parsed.x, parsed.y, {fill: 'transparent', radius: ratio * 10, stroke: 'yellow'});
    });
}

module.exports = {
    run: function(room) {
        draw(room, 0.005);

        if(oneIn(54))
            constructRoads(room, 2, 230, 0.005);

        if(oneIn(1000 * 1000)) // Might never happen
            resetVotes(room);
	}
};