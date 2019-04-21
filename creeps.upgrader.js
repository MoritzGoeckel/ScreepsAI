var utils = require('./opts.utils');
var voteomat = require('./opts.voteomat');
var behaviours = require('./creeps.behaviours');

module.exports = {

    run: function(creep) {
	    if(creep.carry.energy > 0) {
            behaviours.upgradeController(creep);
        }
        else {
            behaviours.getEnergyFromSomewhere(creep);
        }
	}
};