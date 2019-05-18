var expansionMgr = require('./expansion.strategy');

module.exports = {
    run: function(creep){
        if(creep.memory.target == undefined){
            creep.memory.target = expansionMgr.getClaimerRellyPoint(creep.room);
        }        

        if(creep.memory.target != undefined){ 
            let target = creep.memory.target;
            if(target.roomName != creep.pos.roomName){
                // Its a position / Lets go closer
                let pos = new RoomPosition(target.x, target.y, target.roomName); 
                creep.travelTo(pos, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 3});
            } else {
                // We are in the room
                // Could also reserve
                let result = creep.claimController(creep.room.controller);
                
                if(result != OK && result != ERR_NOT_IN_RANGE)                
                    console.log("Claiming error code: " + result)
                
                if(result == ERR_NOT_IN_RANGE) {
                    creep.travelTo(creep.room.controller);
                }

                if(result == ERR_INVALID_TARGET){
                    //Self destruct?
                }
            }
        }

        
    }
}
