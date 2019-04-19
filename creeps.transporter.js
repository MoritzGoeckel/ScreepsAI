var _ = require('lodash');
var utils = require('./opts.utils');
var voteomat = require('./opts.voteomat');

// Todo: Maybe put in utils
function distance(p1, p2){
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

module.exports = {
    
    run: function(creep) {

        if(creep.memory.targetResource == undefined){
            var target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
            if(target == null)
                return;
                
            creep.memory.targetResource = target.id;

            //targets = targets.sort(function(a, b){ return a.amount < b.amount; });

            // We dont want to get into dangerous territory
            //targets = targets.filter(function(target) {
            //    return target.pos.findInRange(FIND_HOSTILE_CREEPS, 8).length == 0 && target.pos.findInRange(FIND_FLAGS, 8).length == 0; // Red flags
            //});

            //var transporter = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'transporter' && creep.memory.targetResource != undefined);
            //let alreadyTakenTargets = [];
            //for(let t in transporter)
            //    alreadyTakenTargets.push(transporter[t].memory.targetResource);

            //let notTakenTargets = _.filter(target, (t) => alreadyTakenTargets.indexOf(t.id) == -1);

            //if(notTakenTargets.length > 0){
            //    creep.memory.targetResource = notTakenTargets[0].id;
            //}
            //else{
                //creep.say("Nothing to transport");                
            //}
        }
        
        if(creep.memory.targetResource != undefined && _.sum(creep.carry) == 0) {
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
        else if(creep.memory.targetSink == undefined && _.sum(creep.carry) > 0){
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

            // Should prioritize extensions
            let extensions = targets.filter(t => t.structureType == STRUCTURE_EXTENSION);
            if(extensions.length > 0)
                targets = extensions;

            targets = targets.sort(function(a, b){ return distance(a.pos, creep.pos) > distance(b.pos, creep.pos); });            

            //Memory.resourceQueue todo:
            //Move to resourceQueue target

            if(targets.length > 0) {
                creep.memory.targetSink = targets[0].id;
            }
        }

        if(creep.memory.targetSink != undefined){
            var targetSink = Game.getObjectById(creep.memory.targetSink);

            if((targetSink.structureType == STRUCTURE_CONTAINER && targetSink.store[RESOURCE_ENERGY] == targetSink.storeCapacity) 
                    || (targetSink.structureType != STRUCTURE_CONTAINER && targetSink.energy == targetSink.energyCapacity))
            {
                // Sink just got filled
                delete creep.memory.targetSink;
                return;
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

        /*var assignedSource = Game.getObjectById(creep.memory.assignedSource);

        console.log(result);*/

	    /*if(creep.carry.energy < creep.carryCapacity) {
        console.log(creep.carryCapacity);
            
        }
        else {
            
        }*/

	}
};

/*var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }*/