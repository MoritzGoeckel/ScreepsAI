var utils = require('./opts.utils');
var voteomat = require('./opts.voteomat');

module.exports = {
    goSomewhereRandom: function (creep){
        creep.travelTo(new RoomPosition(Math.random() * 30 + 10, Math.random() * 30 + 10, creep.room.name));
    },
    
    getOutOfWay: function (creep){
        var closestCreep = creep.room.find(FIND_CREEPS).filter(c => c.id != creep.id && utils.distance(creep.pos, c.pos) < 3);
        if(closestCreep.length == 0)
            return;
        
        closestCreep = closestCreep.sort(function(a, b){ return utils.distance(a.pos, creep.pos) > utils.distance(b.pos, creep.pos); });            
        closestCreep = closestCreep[0];
    
        if(utils.distance(closestCreep.pos, creep.pos) > 2)
            return;
    
        let target = new RoomPosition(creep.pos.x * 2 - closestCreep.pos.x, creep.pos.y * 2 - closestCreep.pos.y, creep.room.name);
        //creep.room.visual.circle(target.x, target.y, {fill: 'transparent', radius: 0.5, stroke: 'red'});
        if(creep.travelTo(target) != OK){
            module.exports.goSomewhereRandom(creep);
        }
    },

    getEnergyFromSomewhere: function(creep){
        //Search for energy
        if(creep.memory.pickupPoint == undefined){
            var closestResource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);

            // TODO: That is a quickfix. Should also regard container
            if(closestResource == null)
                return;

            var closestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0
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
    },

    getDroppedResources: function(creep){
        if(creep.memory.targetResource == undefined){
            var target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
            if(target == null)
                return;
                
            creep.memory.targetResource = target.id;
            // Maybe check if someone else is taking it
        }
        
        if(creep.memory.targetResource != undefined) {
            let target = Game.getObjectById(creep.memory.targetResource);
            if(target == null){
                delete creep.memory.targetResource;
                return;
            }

            if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                voteomat.voteRoad(creep);
                creep.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 1});
            }
        }
    },

    bringResourcesToExtensions: function(creep){
        if(creep.memory.targetSink == undefined){
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity;
                    }
            });

            // Maybe have a queue

            if(target != null)
                creep.memory.targetSink = target.id;
            else
                return false;
        }

        if(creep.memory.targetSink != undefined){
            var targetSink = Game.getObjectById(creep.memory.targetSink);

            if(targetSink.energy == targetSink.energyCapacity)
            {
                // Sink just got filled
                delete creep.memory.targetSink;
                return module.exports.bringResourcesToExtensions(creep); // Recoursion
            }

            let result = creep.transfer(targetSink, RESOURCE_ENERGY);
            if(result == ERR_NOT_IN_RANGE) {
                voteomat.voteRoad(creep);
                creep.travelTo(targetSink, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else if(result == OK){
                delete creep.memory.targetSink;
            }
        }

        return true;
    },

    bringResourcesToContainers: function(creep){
        if(creep.memory.targetSink == undefined){
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_TOWER)
                    }
            }).filter(structure => {
                if(structure.structureType == STRUCTURE_CONTAINER && (structure.store[RESOURCE_ENERGY] + (structure.storeCapacity / 10.0)) < structure.storeCapacity) //Todo: only works for energy
                    return true;

                return structure.energy < structure.energyCapacity;
            });

            targets = targets.sort(function(a, b){ return utils.distance(a.pos, creep.pos) > utils.distance(b.pos, creep.pos); });            

            //Memory.resourceQueue todo:
            //Move to resourceQueue target

            if(targets.length > 0) {
                creep.memory.targetSink = targets[0].id;
            }
            else
                return false;
        }

        if(creep.memory.targetSink != undefined){
            var targetSink = Game.getObjectById(creep.memory.targetSink);

            if((targetSink.structureType == STRUCTURE_CONTAINER && targetSink.store[RESOURCE_ENERGY] == targetSink.storeCapacity) 
                    || (targetSink.structureType != STRUCTURE_CONTAINER && targetSink.energy == targetSink.energyCapacity))
            {
                // Sink just got filled
                delete creep.memory.targetSink;
                return module.exports.bringResourcesToContainers(creep); // Recursion
            }

            let result = creep.transfer(targetSink, RESOURCE_ENERGY);
            if(result == ERR_NOT_IN_RANGE) {
                voteomat.voteRoad(creep);
                creep.travelTo(targetSink, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else if(result == OK){
                delete creep.memory.targetSink;
            }
        }

        return true;
    },

    upgradeController(creep){
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}, maxRooms: 1});
            voteomat.voteRoad(creep);
        }
    }
};