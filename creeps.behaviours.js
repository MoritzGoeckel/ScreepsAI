var utils = require('./opts.utils');
var voteomat = require('./opts.voteomat');

module.exports = {

    // Todo: Maybe have a model with two methods per actions: OrderAction, PerformAction

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
            // Maybe use a scoring system just like in getDroppedFromSomewhere

            var closestResource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                filter: function(object) {
                    return object.resourceType == RESOURCE_ENERGY;
                }
            });

            var closestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0
            });

            var closestTombstone = creep.pos.findClosestByRange(FIND_TOMBSTONES, {
                filter: (tombstone) => tombstone.store[RESOURCE_ENERGY] > 0
            });

            if(closestTombstone != null && creep.room.findPath(creep.pos, closestTombstone.pos).length < 30)
                pickupPoint = closestTombstone;
            else if(closestResource == null || 
                (closestContainer != null && creep.room.findPath(creep.pos, closestContainer.pos).length < creep.room.findPath(creep.pos, closestResource.pos).length))
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

            if(pickupObject == null || (pickupObject.store != undefined && pickupObject.store[RESOURCE_ENERGY] == 0)){
                creep.memory.pickupPoint = undefined;
                delete creep.memory.pickupPoint;
                return;
            }

            if(pickupObject.structureType == STRUCTURE_CONTAINER || pickupObject.deathTime != undefined){
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
                creep.memory.pickupPoint = undefined;
                delete creep.memory.pickupPoint;
            }
        }
    },

    getDroppedResources: function(creep){
        if(creep.memory.targetResource == undefined){
            let targets = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: function(object) {
                    return object.resourceType == RESOURCE_ENERGY;
                }
            });

            // Scoring with lowest of (distance / amount)
            targets = targets.sort(function(a, b){ return utils.distance(a.pos, creep.pos) / a.amount > utils.distance(b.pos, creep.pos) / b.amount; });           

            if(targets.length != 0){
                creep.memory.targetResource = targets[0].id;;
            }
            else
                return false;
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

    unreservedExtensionsExist: function(creep){
        if(creep.room.memory.reservedExtensions == undefined){
            creep.room.memory.reservedExtensions = {};
        }

        if(creep.memory.targetExtensionSink == undefined){
            let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity 
                            && (creep.room.memory.reservedExtensions[structure.id] == undefined || creep.room.memory.reservedExtensions[structure.id] < Game.time - 5);
                    }
            });

            targets = targets.sort(function(a, b){ return utils.distance(a.pos, creep.pos) > utils.distance(b.pos, creep.pos); });            

            if(targets.length != 0){
                creep.memory.targetExtensionSink = targets[0].id;
                return true;
            }
            else
                return false;
        }

        return creep.memory.targetExtensionSink != undefined;
    },

    bringResourcesToExtensions: function(creep){
        if(module.exports.unreservedExtensionsExist(creep) == false)
            return false;

        if(creep.memory.targetExtensionSink != undefined){
            var targetExtensionSink = Game.getObjectById(creep.memory.targetExtensionSink);
            creep.room.visual.circle(targetExtensionSink.pos.x, targetExtensionSink.pos.y, {fill: 'transparent', radius: 0.5, stroke: 'red'});

            if(targetExtensionSink == null || targetExtensionSink.energy == targetExtensionSink.energyCapacity)
            {
                // Sink just got filled
                delete creep.memory.targetExtensionSink;
                delete creep.room.memory.reservedExtensions[creep.memory.targetExtensionSink];
                return module.exports.bringResourcesToExtensions(creep); // Recoursion
            }

            let result = creep.transfer(targetExtensionSink, RESOURCE_ENERGY);
            if(result == ERR_NOT_IN_RANGE) {
                creep.room.memory.reservedExtensions[creep.memory.targetExtensionSink] = Game.time;
                voteomat.voteRoad(creep);
                creep.travelTo(targetExtensionSink, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else if(result == OK){
                delete creep.room.memory.reservedExtensions[creep.memory.targetExtensionSink];
                delete creep.memory.targetExtensionSink;
            }
            else{
                console.log("Strange error code when filling extension")
            }
        }

        return true;
    },

    containerNeedResources: function(creep){
        return creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER ||
                        structure.structureType == STRUCTURE_TOWER)
            }
        }).filter(structure => {
            return (structure.structureType == STRUCTURE_CONTAINER && (structure.store[RESOURCE_ENERGY] + (structure.storeCapacity / 10.0)) < structure.storeCapacity); //Todo: only works for energy
        }).length != 0;
    },

    bringResourcesToContainers: function(creep, maxDistance){
        if(maxDistance == undefined)
            maxDistance = 100;

        if(creep.memory.targetSink == undefined){
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_TOWER)
                    }
            }).filter(structure => {
                return ((structure.structureType == STRUCTURE_CONTAINER && (structure.store[RESOURCE_ENERGY] + (structure.storeCapacity / 10.0)) < structure.storeCapacity)
                    || (structure.structureType == STRUCTURE_TOWER && (structure.energy + (structure.energyCapacity / 10.0)) < structure.energyCapacity))
                    && utils.distance(structure.pos, creep.pos) < maxDistance; //Todo: only works for energy
            });

            targets = targets.sort(function(a, b){ return utils.distance(a.pos, creep.pos) > utils.distance(b.pos, creep.pos); });            

            if(targets.length > 0) {
                creep.memory.targetSink = targets[0].id;
            }
            else
                return false;
        }

        if(creep.memory.targetSink != undefined){
            var targetSink = Game.getObjectById(creep.memory.targetSink);
            
            if(targetSink == null 
                || (targetSink.structureType == STRUCTURE_CONTAINER && targetSink.store[RESOURCE_ENERGY] == targetSink.storeCapacity))
            {
                // Sink just got filled
                delete creep.memory.targetSink;
                return module.exports.bringResourcesToContainers(creep, maxDistance); // Recursion
            }

            let result = creep.transfer(targetSink, RESOURCE_ENERGY);
            if(result == ERR_NOT_IN_RANGE) {
                voteomat.voteRoad(creep);
                creep.travelTo(targetSink);
            }
            else if(result == OK){
                delete creep.memory.targetSink;
                return true;
            }
            else{
                console.log("Strange error code when filling container" + result)
                delete creep.memory.targetSink;
                return false;
            }
        }

        return true;
    },

    upgradeController: function(creep){
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}, maxRooms: 1});
            voteomat.voteRoad(creep);
        }
    },

    recycle: function(creep){
        if(creep.memory.recycleSpawn == undefined){
            let spawn = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (i) => i.structureType == STRUCTURE_SPAWN
            });

            if(spawn == null){
                console.log("Cant fint spawn to recycle");
                return;
            }

            creep.memory.recycleSpawn = spawn.id;
        }

        if(creep.memory.recycleSpawn != undefined){
            let targetSpawn = Game.getObjectById(creep.memory.recycleSpawn);
            if(targetSpawn.recycleCreep(creep) == ERR_NOT_IN_RANGE)
                creep.travelTo(targetSpawn);
        }
    },

    dropEverything(creep){
        for(var resourceType in creep.carry) {
            creep.drop(resourceType);
        }
    }
};