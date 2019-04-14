function record(room){
    if(Memory.posDict == undefined)
        Memory.posDict = {};

    for(var name in Memory.creeps) {
        if(Game.creeps[name]) {
            var pos = Game.creeps[name].pos;

            if(pos.roomName != room.name)
                continue;

            var key = JSON.stringify(pos);

            if(Memory.posDict[key] == undefined)
                Memory.posDict[key] = 0; // Todo: Memory will become large
            Memory.posDict[key]++;
        }
    }
}

function constructRoads(room, maximum){
    var existingSitesList = room.find(FIND_MY_CONSTRUCTION_SITES); 

    existingSitesList = existingSitesList.filter(function(site) {
        return site.structureType == STRUCTURE_ROAD;
    });

    let existingSites = existingSitesList.length;

    if(existingSites >= maximum)
        return;

    var items = Object.keys(Memory.posDict).map(function(key) {
        return [key, Memory.posDict[key]];
    });

    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    for(var i in items){
        var parsed = JSON.parse(items[i][0]);
        const pos = new RoomPosition(parsed.x, parsed.y, parsed.roomName);

        if(pos.roomName != room.name)
            continue;

        if(pos.createConstructionSite(STRUCTURE_ROAD) == 0){
            existingSites++;
        }

        if(existingSites >= maximum)
            return;
    }
}

module.exports = {
    run: function(room) {
        record(room);

        if(Math.random() > 0.5)
            constructRoads(room, 5);
//STRUCTURE_CONTAINER 
        
	}
};