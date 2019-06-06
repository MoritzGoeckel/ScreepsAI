var utils = require('./opts.utils');
var voteomat = require('./opts.voteomat');
var constructionUtils = require('./planner.utils');
var claimMgr = require('./opts.claimmgr');

var guidelines = require('./guidelines');

var containerMgr = require('./manager.containerPriority');

let BASE_RADIUS = 10;

module.exports = {

    // Todo: Maybe have a model with two methods per actions: OrderAction, PerformAction

    goSomewhereRandom: function (creep){
        creep.travelTo(new RoomPosition(Math.random() * 30 + 1, Math.random() * 30 + 1, creep.room.name));
    },

    goIntoSafety: function(creep){
        if(utils.distance(creep.pos, guidelines.getCenter(creep.room)) < BASE_RADIUS)
            return false;

        creep.travelTo(guidelines.getCenter(creep.room));
        return true;
    },
    
    getOutOfWay: function (creep){
        if(constructionUtils.mayBuild(creep.pos, creep.room) == false){
            module.exports.goSomewhereRandom(creep);
            return;
        }
        
        var closestCreep = creep.room.find(FIND_CREEPS).filter(c => c.id != creep.id && utils.distance(creep.pos, c.pos) < 3);
        if(closestCreep.length == 0)
            return;
        
        closestCreep = closestCreep.sort(function(a, b){ return utils.distance(a.pos, creep.pos) > utils.distance(b.pos, creep.pos); });            
        closestCreep = closestCreep[0];
    
        if(utils.distance(closestCreep.pos, creep.pos) > 2)
            return;
    
        let x = creep.pos.x * 2 - closestCreep.pos.x;
        let y = creep.pos.y * 2 - closestCreep.pos.y;
        
        x = Math.max(x, 1);
        x = Math.min(x, 49);
        
        y = Math.max(y, 1);
        y = Math.min(y, 49);
    
        let target = new RoomPosition(x, y, creep.room.name);
        //creep.room.visual.circle(target.x, target.y, {fill: 'transparent', radius: 0.5, stroke: 'red'});
        if(creep.travelTo(target) != OK){
            module.exports.goSomewhereRandom(creep);
        }
    }, 

    getEnergyFromSomewhere: function(creep){
        //Search for energy
        //creep.say("Energy")
        if(creep.memory.target == undefined){
            let targets = [];
            let droppedResources = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: function(object) {
                    return object.resourceType == RESOURCE_ENERGY && object.amount > claimMgr.claimedAmount(object.id);
                }
            }); 
            targets = targets.concat(droppedResources.map(r => {r.score = r.amount; return r;})); // Double priority for dropped resources
            
            let containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) 
                                        && structure.store[RESOURCE_ENERGY] > claimMgr.claimedAmount(structure.id)
            });
            targets = targets.concat(containers.map(c => {c.score = c.store[RESOURCE_ENERGY]; return c;})); // Normal priority for container
            
            let tombstones = creep.room.find(FIND_TOMBSTONES, {
                filter: (tombstone) => tombstone.store[RESOURCE_ENERGY] > claimMgr.claimedAmount(tombstone.id)
            });
            targets = targets.concat(tombstones.map(c => {c.score = c.store[RESOURCE_ENERGY]; return c;})); // 1.5 priority for tombstone

            targets = targets.sort(function(a, b){ 
                return (utils.distance(a.pos, creep.pos) / Math.min(a.score - claimMgr.claimedAmount(a.id), creep.carryCapacity)) 
                    > (utils.distance(b.pos, creep.pos) / Math.min(b.score - claimMgr.claimedAmount(b.id), creep.carryCapacity)); 
            }); 
           
            if(targets.length == 0)
                return; 
 
            creep.memory.target = targets[0].id;
            claimMgr.claimTransport(creep, targets[0].id);
        }
        
        if(creep.memory.target != undefined)
        {
            let pickupObject = Game.getObjectById(creep.memory.target);

            function removeTarget(){
                claimMgr.unclaimTransport(creep, creep.memory.target);
                creep.memory.target = undefined;
                delete creep.memory.target;
                return;
            }


            if(pickupObject == null || (pickupObject.store != undefined && pickupObject.store[RESOURCE_ENERGY] == 0)){
                return removeTarget();
            }

            if(pickupObject.structureType == STRUCTURE_CONTAINER 
                || pickupObject.structureType == STRUCTURE_STORAGE 
                || pickupObject.deathTime != undefined)
            {
                let result = creep.withdraw(pickupObject, RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE)
                    creep.travelTo(pickupObject.pos, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 1})
                
                if(result == ERR_NOT_ENOUGH_RESOURCES || result == OK){
                    return removeTarget();
                }
            }
            else if(creep.pickup(pickupObject) == ERR_NOT_IN_RANGE) {
                creep.travelTo(pickupObject.pos, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 1});
            }else{
                return removeTarget();
            }
        }
    },

    getDroppedResources: function(creep){
        //creep.say("Dropped")
        if(creep.memory.target == undefined){
            let targets = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: function(object) {
                    return object.resourceType == RESOURCE_ENERGY && object.amount > claimMgr.claimedAmount(object.id);
                }
            });
            
            // Balance containers. Maybe have priority containers 
            
            let lowPriorityContainer = creep.room.find(FIND_STRUCTURES, {
                filter: function(object) {
                    if(object.structureType == STRUCTURE_CONTAINER)
                        object.amount = object.store[RESOURCE_ENERGY];
                        
                    return object.structureType == STRUCTURE_CONTAINER && object.store[RESOURCE_ENERGY] > claimMgr.claimedAmount(object.id) && containerMgr.getPriority(object.id, creep.room) < 0;
                }
            });
            
            targets = targets.concat(lowPriorityContainer);
            
            targets = targets.sort(function(a, b){ 
                return (utils.distance(a.pos, creep.pos) / Math.min(a.amount - claimMgr.claimedAmount(a.id), creep.carryCapacity)) 
                    > (utils.distance(b.pos, creep.pos) / Math.min(b.amount - claimMgr.claimedAmount(b.id), creep.carryCapacity)); 
            });           
            
            if(targets.length != 0){
                creep.memory.target = targets[0].id;
                claimMgr.claimTransport(creep, creep.memory.target);
            }
            else
                return false;
        }
        
        if(creep.memory.target != undefined) {
            let target = Game.getObjectById(creep.memory.target);
            
            function removeTarget(){
                claimMgr.unclaimTransport(creep, creep.memory.target);
                delete creep.memory.target;
            }
            
            if(target == null){
                removeTarget();
                return;
            }

            let result;
            if(target.structureType != undefined){
                result = creep.withdraw(target, RESOURCE_ENERGY);
            } else{
                result = creep.pickup(target);
            }
            
            if(result == ERR_NOT_IN_RANGE) {
                voteomat.voteRoad(creep);
                creep.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 1});
            } else {
                removeTarget();
                return;
            }
        }
    },

    unreservedExtensionsExist: function(creep){
        if(creep.room.memory.reservedExtensions == undefined){
            creep.room.memory.reservedExtensions = {};
        }

        if(creep.memory.target == undefined){
            let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => { //|| structure.structureType == STRUCTURE_TOWER
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity 
                            && (creep.room.memory.reservedExtensions[structure.id] == undefined || creep.room.memory.reservedExtensions[structure.id] < Game.time - 5);
                    }
            });

            // TODO: Seems to not work. Is filling wierd extensions that are far away
            targets = targets.sort(function(a, b){ return utils.distance(a.pos, creep.pos) > utils.distance(b.pos, creep.pos); });            

            if(targets.length != 0){
                creep.memory.target = targets[0].id;
                return true;
            }
            else
                return false;
        }

        return creep.memory.target != undefined;
    },

    bringResourcesToExtensions: function(creep){
        if(module.exports.unreservedExtensionsExist(creep) == false)
            return false;

        if(creep.memory.target != undefined){
            var targetExtensionSink = Game.getObjectById(creep.memory.target);
            creep.room.visual.circle(targetExtensionSink.pos.x, targetExtensionSink.pos.y, {fill: 'transparent', radius: 0.5, stroke: 'red'});

            if(targetExtensionSink == null || targetExtensionSink.energy == targetExtensionSink.energyCapacity)
            {
                // Sink just got filled
                delete creep.memory.target;
                delete creep.room.memory.reservedExtensions[creep.memory.target];
                return module.exports.bringResourcesToExtensions(creep); // Recoursion
            }

            let result = creep.transfer(targetExtensionSink, RESOURCE_ENERGY);
            if(result == ERR_NOT_IN_RANGE) {
                creep.room.memory.reservedExtensions[creep.memory.target] = Game.time;
                voteomat.voteRoad(creep);
                creep.travelTo(targetExtensionSink, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else if(result == OK){
                delete creep.room.memory.reservedExtensions[creep.memory.target];
                delete creep.memory.target;
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
                return (structure.structureType == STRUCTURE_CONTAINER 
                || structure.structureType == STRUCTURE_STORAGE
                || structure.structureType == STRUCTURE_TOWER)
            }
        }).filter(structure => {
            return ((structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) 
                    && (structure.store[RESOURCE_ENERGY] + (structure.storeCapacity / 10.0)) < structure.storeCapacity)
                    && (containerMgr.getPriority(structure.id, creep.room) >= 0); //Todo: only works for energy
        }).length != 0;
    },

    bringResourcesToContainers: function(creep, maxDistance){
        if(maxDistance == undefined)
            maxDistance = 100;

        if(creep.memory.target == undefined){
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_STORAGE ||
                                structure.structureType == STRUCTURE_TOWER)
                    }
            }).filter(structure => {
                return (((structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && (structure.store[RESOURCE_ENERGY] + (structure.storeCapacity / 10.0)) < structure.storeCapacity)
                    || (structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity))
                    && utils.distance(structure.pos, creep.pos) < maxDistance
                    && containerMgr.getPriority(structure.id, creep.room) >= 0; //Todo: only works for energy
            }).map(target => {
                target.score = ((containerMgr.getPriority(target.id, creep.room) * 10) + 1) / utils.distance(target.pos, creep.pos);
                return target;
            });

            // Tower is priority
            targets = targets.sort(function(a, b){ 
                    return (a.score > b.score) // TODO: Test scoring. Correct?
                        || a.structureType == STRUCTURE_TOWER;
            });            

            if(targets.length > 0) {
                creep.memory.target = targets[0].id;
            }
            else
                return false;
        }

        if(creep.memory.target != undefined){
            var targetSink = Game.getObjectById(creep.memory.target);
            
            if(targetSink == null 
                || (targetSink.structureType == STRUCTURE_CONTAINER && targetSink.store[RESOURCE_ENERGY] == targetSink.storeCapacity))
            {
                // Sink just got filled
                delete creep.memory.target;
                return module.exports.bringResourcesToContainers(creep, maxDistance); // Recursion
            }

            let result = creep.transfer(targetSink, RESOURCE_ENERGY);
            if(result == ERR_NOT_IN_RANGE) {
                voteomat.voteRoad(creep);
                creep.travelTo(targetSink);
            }
            else if(result == OK){
                delete creep.memory.target;
                return true;
            }
            else{
                console.log("Strange error code when filling container" + result)
                delete creep.memory.target;
                return false;
            }
        }

        return true;
    },

    upgradeController: function(creep){
        if(utils.distance(creep.pos, creep.room.controller.pos) > 2){
            if(creep.travelTo(creep.room.controller) == OK)
                return;
        }
        
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}, maxRooms: 1});
            voteomat.voteRoad(creep);
        }
    },

    recycle: function(creep){
        if(creep.memory.target == undefined){
            let spawn = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (i) => i.structureType == STRUCTURE_SPAWN
            });

            if(spawn == null){
                console.log("Cant fint spawn to recycle");
                return;
            }

            creep.memory.target = spawn.id;
        }

        if(creep.memory.target != undefined){
            let targetSpawn = Game.getObjectById(creep.memory.target);
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
