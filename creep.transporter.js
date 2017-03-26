var _ = require('lodash');

module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.targetResource == undefined){
            var targets = creep.room.find(FIND_DROPPED_ENERGY);
            targets = targets.sort(function(a, b){ return a.amount < b.amount; });

            var transporter = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'transporter' && creep.memory.targetResource != undefined);
            let alreadyTakenTargets = [];
            for(let t in transporter)
                alreadyTakenTargets.push(transporter[t].memory.targetResource);

            let notTakenTargets = _.filter(targets, (target) => alreadyTakenTargets.indexOf(target.id) == -1);

            if(notTakenTargets.length > 0){
                creep.memory.targetResource = notTakenTargets[0].id;
                creep.say("Picking up " + notTakenTargets[0].amount);
            }
            else{
                creep.say("Nothing to transport");                
            }
        }
        
        if(creep.memory.targetResource != undefined && _.sum(creep.carry) == 0) {
            let target = Game.getObjectById(creep.memory.targetResource);
            if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 1});
            }
        }
        else if(_.sum(creep.carry) > 0){
            
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });

            //Memory.resourceQueue todo:

            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
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
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }*/