var utils = require('./opts.utils');
var behaviours = require('./creeps.behaviours');

var roleBuilder = {

    // Should he also upgrade the controller?

    run: function(creep) {

	    if(creep.carry.energy == 0){
            behaviours.getEnergyFromSomewhere(creep);
        }
	    else {
            // Build or upgrade

            if(creep.memory.structureToRepair != undefined){
                let structure = Game.getObjectById(creep.memory.structureToRepair);
                var result = creep.repair(structure);
                if (result == ERR_NOT_IN_RANGE) {
                    creep.travelTo(structure);
                }
                if(structure.hits >= structure.hitsMax){
                    delete creep.memory.structureToRepair;
                }
            }
            // Refactor. That is too deep
            else {
                // TODO: This should not be done every time. Maybe coordinate better
                var buildTarget = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if(buildTarget != null) {
                    if(creep.build(buildTarget) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(buildTarget, {visualizePathStyle: {stroke: '#ffffff'}, maxRooms: 1});
                    }
                } else {
                    // Todo: Test this
                    let repairThreshold = 0.8;
                    if(creep.memory.structureToRepair == undefined){
                        // Maybe should also enable walls to be repaired
                        // Todo: Should prioritize
                        let structureToRepair = creep.pos.findClosestByRange(
                            FIND_STRUCTURES, 
                            {filter: (s) => 
                                ((s.hits < s.hitsMax * repairThreshold) && 
                                s.structureType != STRUCTURE_WALL && // Not repairing walls
                                s.structureType != STRUCTURE_ROAD && // Not repairing roads
                                s.structureType != STRUCTURE_RAMPART)
                                || (s.structureType == STRUCTURE_RAMPART && s.hits < 100000)  // Reparing RAMPART with less hitpoints
                            });

                        if (structureToRepair != null) {
                            creep.memory.structureToRepair = structureToRepair.id;
                        }
                        else{
                            if(behaviours.bringResourcesToExtensions(creep) == false)
                                behaviours.getOutOfWay(creep);
                        }
                    }
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