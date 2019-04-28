var _ = require('lodash');
var behaviours = require('./creeps.behaviours');

module.exports = {
    run: function(creep) {

        // TODO: Balance containers

        if(creep.room.energyAvailable == creep.room.energyCapacityAvailable){
            delete creep.memory.doingExtensions;
        }

        if(creep.memory.doingExtensions == undefined){
            if(creep.room.energyAvailable < creep.room.energyCapacityAvailable){
                let numDoingExtensions = 0;
                for(const name in Game.creeps) {
                    if(Game.creeps[name].memory.doingExtensions != undefined)
                        numDoingExtensions++;
                }
                //console.log("Doing extensions: " + numDoingExtensions)

                if((numDoingExtensions < 3 && behaviours.unreservedExtensionsExist(creep)) || behaviours.containerNeedResources(creep) == false)
                    creep.memory.doingExtensions = true;
            }
        }

        if(creep.memory.doingExtensions == undefined){
            if(_.sum(creep.carry) == 0){
                //creep.say("CONTAINER res")
                behaviours.getDroppedResources(creep);
            }
            else{
                //creep.say("CONTAINER")
                if(behaviours.bringResourcesToContainers(creep) == false){
                    creep.say("Idle")
                    behaviours.getOutOfWay(creep);
                }
            }
        }
        
        if(creep.memory.doingExtensions != undefined){
            if(_.sum(creep.carry) < 50){
                //creep.say("EXTENSION res")
                behaviours.getEnergyFromSomewhere(creep);
            }
            else{
                //creep.say("EXTENSION")
                if(!behaviours.unreservedExtensionsExist(creep))
                    delete creep.memory.doingExtensions;

                behaviours.bringResourcesToExtensions(creep);
            }
        }
	}
};