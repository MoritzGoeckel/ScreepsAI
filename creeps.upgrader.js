var roleUpgrader = {

    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 find resources');

            //Enque Memory.resourceQueue
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.travelTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}, maxRooms: 1});
            }
        }
        else {
            if(creep.memory.pickupPoint == undefined){
                var pickupPoint = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                if(pickupPoint != null){
                    let path = creep.room.findPath(creep.pos, pickupPoint.pos, { maxOps: 5 });
                    if(path.length && path.length <= 5)
                        creep.memory.pickupPoint = pickupPoint.id;
                }
            }
            
            if(creep.memory.pickupPoint != undefined)
            {
                
                if(creep.pickup(Game.getObjectById(creep.memory.pickupPoint)) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(Game.getObjectById(creep.memory.pickupPoint).pos, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 1});
                }else{
                    
                    //Deque Memory.resourceQueue
                    
                    creep.memory.pickupPoint = undefined;
                    delete creep.memory.pickupPoint;
                }
            }
        }
	}
};

module.exports = roleUpgrader;