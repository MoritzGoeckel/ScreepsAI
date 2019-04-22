var _ = require('lodash');
var behaviours = require('./creeps.behaviours');

module.exports = {
    run: function(creep) {
        //creep.room
        //TODO: handle tompstones
        
        if(creep.room.energyAvailable < creep.room.energyCapacityAvailable){
            if(_.sum(creep.carry) == 0)
                behaviours.getEnergyFromSomewhere(creep);
            else{
                behaviours.bringResourcesToExtensions(creep);
            }
        }
        else{
            if(_.sum(creep.carry) == 0)
                behaviours.getDroppedResources(creep);
            else{
                behaviours.bringResourcesToContainers(creep);
            }
        }
	}
};