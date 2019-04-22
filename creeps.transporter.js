var _ = require('lodash');
var behaviours = require('./creeps.behaviours');

module.exports = {
    run: function(creep) {

        if(creep.room.energyAvailable == creep.room.energyCapacityAvailable){
            delete creep.memory.doingExtensions;
        }

        if(creep.memory.doingExtensions == undefined){
            if(creep.room.energyAvailable < creep.room.energyCapacityAvailable && _.sum(creep.carry) == 0){
                let numDoingExtensions = 0;
                for(const name in Game.creeps) {
                    if(Game.creeps[name].memory.doingExtensions != undefined)
                        numDoingExtensions++;
                }
                //console.log("Doing extensions: " + numDoingExtensions)

                if(numDoingExtensions < 3 && behaviours.unreservedExtensionsExist(creep))
                    creep.memory.doingExtensions = true;
            }
        }

        if(creep.memory.doingExtensions == undefined){
            if(_.sum(creep.carry) == 0){
                creep.say("CONTAINER res")
                behaviours.getDroppedResources(creep);
            }
            else{
                creep.say("CONTAINER")
                behaviours.bringResourcesToContainers(creep);
            }
        }
        
        if(creep.memory.doingExtensions != undefined){
            if(_.sum(creep.carry) == 0){
                creep.say("EXTENSION res")
                behaviours.getEnergyFromSomewhere(creep);
            }
            else{
                creep.say("EXTENSION")
                if(!behaviours.unreservedExtensionsExist(creep))
                    delete creep.memory.doingExtensions;

                behaviours.bringResourcesToExtensions(creep);
            }
        }
	}
};