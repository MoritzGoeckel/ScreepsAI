var utils = require('./opts.utils');

var roleBuilder = {

    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;

            //Enque Memory.resourceQueue
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }

	    if(creep.memory.building) {
            // Build or upgrade

            if(creep.memory.structureToRepair != undefined && creep.memory.structureToRepair != null){
                let structure = Game.getObjectById(creep.memory.structureToRepair);
                var result = creep.repair(structure);
                if (result == ERR_NOT_IN_RANGE) {
                    creep.travelTo(structure);
                }
                if(structure.hits >= structure.hitsMax){
                    creep.memory.structureToRepair = null;
                }
            }
            // Refactor. That is too deep
            else {
                // TODO: This should not be done every time. Maybe coordinate better
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length != 0) {
                    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}, maxRooms: 1});
                    }
                } else {
                    // Todo: Test this
                    if(creep.memory.structureToRepair == undefined || creep.memory.structureToRepair == null){
                        // Maybe should also enable walls to be repaired
                        let structureToRepair = creep.pos.findClosestByRange(
                            FIND_MY_STRUCTURES, 
                            {filter: (s) => 
                                (s.hits < s.hitsMax && 
                                s.structureType != STRUCTURE_WALL && 
                                s.structureType != STRUCTURE_RAMPART) 
                                || (s.structureType == STRUCTURE_RAMPART && s.hits < 100000) 
                            });

                        if (structureToRepair != undefined) {
                            creep.memory.structureToRepair = structureToRepair.id;
                        }
                    }
                }
            }
	    }
	    else {

            // This is doublicated code with upgrader
            //Search for energy
            if(creep.memory.pickupPoint == undefined){
                var closestResource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                var closestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 100
                });

                if(closestContainer != null && creep.room.findPath(creep.pos, closestContainer.pos).length < creep.room.findPath(creep.pos, closestResource.pos).length)
                    pickupPoint = closestContainer;
                else
                    pickupPoint = closestResource;

                if(pickupPoint != null){
                    //let path = creep.room.findPath(creep.pos, pickupPoint.pos, { maxOps: 5 });
                    //if(path.length && path.length <= 5)
                    creep.memory.pickupPoint = pickupPoint.id;
                }
            }
            
            if(creep.memory.pickupPoint != undefined)
            {
                let pickupObject = Game.getObjectById(creep.memory.pickupPoint);

                if(pickupObject == null){
                    creep.memory.pickupPoint = undefined;
                    delete creep.memory.pickupPoint;
                    return;
                }

                if(pickupObject.structureType == STRUCTURE_CONTAINER){
                    let result = creep.withdraw(pickupObject, RESOURCE_ENERGY);
                    if(result == ERR_NOT_IN_RANGE)
                        creep.travelTo(pickupObject.pos, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 1})
                    
                    if(result == ERR_NOT_ENOUGH_RESOURCES || result == OK){
                        creep.memory.pickupPoint = undefined;
                        delete creep.memory.pickupPoint;
                    }
                }
                else if(creep.pickup(pickupObject) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(pickupObject.pos, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 1});
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


/*
const targets = creep.room.find(FIND_STRUCTURES, {
    filter: object => object.hits < object.hitsMax
});

targets.sort((a,b) => a.hits - b.hits);

if(targets.length > 0) {
    if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0]);
    }
}
*/