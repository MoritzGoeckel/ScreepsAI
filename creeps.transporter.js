var _ = require('lodash');
var behaviours = require('./creeps.behaviours');

module.exports = {
    
    run: function(creep) {
        if(_.sum(creep.carry) == 0)
            behaviours.getDroppedResources(creep);
        else{
            behaviours.bringResourcesToContainers(creep);
        }
	}
};