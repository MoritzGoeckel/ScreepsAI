var utils = require('./opts.utils');
var behaviours = require('./creeps.behaviours');

var roleBuilder = {

    //creep.room.visual.circle(buildTarget.pos.x, buildTarget.pos.y, {fill: 'transparent', radius: 0.3, stroke: 'orange'});

    run: function(creep) {

        let repairThreshold = 0.8;
	    if(creep.carry.energy == 0){
            behaviours.getEnergyFromSomewhere(creep);
            return;
        }

        // New order
        if(creep.memory.structureToRepair == undefined && creep.memory.structureToBuild == undefined){
            // 1. BUILD
            var structureToBuild = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES); // TODO: This should have a priority. INFRASTRUCUTRE FIRST
            if(structureToBuild != null) {
                creep.memory.structureToBuild = structureToBuild.id;              
            } else {
                // 2. REPAIR

                // TODO: Maybe should also enable walls to be repaired
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
                    // 4. Upgrade controller
                    behaviours.upgradeController(creep);

                    // Fill extension
                    //if(behaviours.bringResourcesToExtensions(creep) == false){
                        
                    //}
                }
            }
        }

        //Exec repair
        if(creep.memory.structureToRepair != undefined){
            let structure = Game.getObjectById(creep.memory.structureToRepair);

            if(structure == null || structure.hits >= structure.hitsMax){
                delete creep.memory.structureToRepair;
            }

            if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                creep.travelTo(structure);
            }
            return;
        }

        //Exec build
        if(creep.memory.structureToBuild != undefined) {
            let structureToBuild = Game.getObjectById(creep.memory.structureToBuild);
            
            if(structureToBuild == null){
                delete creep.memory.structureToBuild;
            }
            
            if(creep.build(structureToBuild) == ERR_NOT_IN_RANGE) {
                creep.travelTo(structureToBuild);
            }
            return;
        }

	}
};

module.exports = roleBuilder;