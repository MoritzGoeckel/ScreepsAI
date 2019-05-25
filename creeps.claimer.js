var expansionMgr = require('./expansion.strategy');

module.exports = {
    run: function(creep){
        if(creep.memory.target == undefined){
            creep.memory.target = expansionMgr.getClaimerRellyPoint(creep.room);
        }        

        if(creep.memory.target != undefined){ 
            let target = creep.memory.target;
            
            if(target.x != undefined){
                // Position is target
                let pos = new RoomPosition(target.x, target.y, target.roomName); 
                creep.travelTo(pos, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 3});
                if(target.roomName == creep.pos.roomName){
                    creep.memory.target = creep.room.controller.id;
                }
            }
            else{
                // Controller is target
                let c = Game.getObjectById(creep.memory.target);
                let result = creep.claimController(c);
                
                if(result == ERR_NOT_IN_RANGE) {
                    creep.travelTo(creep.room.controller, {maxRooms: 1});
                }

                if(c.my){
                    //Self destruct?
                    console.log("Done claiming, removing creep")
                    creep.suicide();
                } else if(result != OK && result != ERR_NOT_IN_RANGE)                
                    console.log("Claiming error code: " + result)
            }
        }
    }
}
