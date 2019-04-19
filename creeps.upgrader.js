var utils = require('./opts.utils');
var voteomat = require('./opts.voteomat');

var roleUpgrader = {

    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;

            //Enque Memory.resourceQueue
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.travelTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}, maxRooms: 1});
                voteomat.voteRoad(creep);
            }
        }
        else {
            //TODO: remove doublicated code. Make "get some energy somewhere" generic. Also enable them to take tombstone energy (Its also in builder)
            if(creep.memory.pickupPoint == undefined){
                var closestResource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);

                // TODO: That is a quickfix. Should also regard container
                if(closestResource == null)
                    return;

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
                    if(result == ERR_NOT_IN_RANGE){
                        voteomat.voteRoad(creep);
                        creep.travelTo(pickupObject.pos, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 1})
                    }
                    
                    if(result == ERR_NOT_ENOUGH_RESOURCES || result == OK){
                        creep.memory.pickupPoint = undefined;
                        delete creep.memory.pickupPoint;
                    }
                }
                else if(creep.pickup(pickupObject) == ERR_NOT_IN_RANGE) {
                    voteomat.voteRoad(creep);
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

module.exports = roleUpgrader;