var roleBuilder = {

    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
			creep.say('🔄 find resources');

            //Enque Memory.resourceQueue
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}, maxRooms: 1});
                }
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

module.exports = roleBuilder;