function make(roomMemory){
    if(roomMemory.container_priority == undefined){
        roomMemory.container_priority = {};
    }
}

module.exports = {
    closeSetPriority: function(pos, searchDistance, priority){
        let room = Game.rooms[pos.roomName];
        
        let result = pos.findInRange(FIND_STRUCTURES, searchDistance).filter(function(structure) {
            return structure.structureType == STRUCTURE_CONTAINER;
        });
        
        for(let r in result){
            room.visual.circle(result[r].pos, {fill: 'transparent', radius: 1, stroke: 'yellow'});
            module.exports.setPriority(result[r], priority);
        }
    },
    setPriority: function(container, priority){
        let roomMemory = Memory.rooms[container.pos.roomName];
        make(roomMemory);
        roomMemory.container_priority[container.id] = priority;
    },
    getPriority: function(containerid, room){
        make(room);
        
        let result = room.memory.container_priority[containerid];
        
        if(result == undefined)
            return 0;
        
        return result;
    },
    clearNonExistant(room){
        if(room.memory.container_priority != undefined){
            for(let id in room.memory.container_priority){
                console.log(id);
                // Check if object exists.
                // If not remove
                // TODO
            }
        }
    }
};