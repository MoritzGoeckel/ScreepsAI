var utils = require('./opts.utils');
var behaviours = require('./creeps.behaviours');

module.exports = {
    run: function(creep) {
        var roles = {
            "extracter": require('./creeps.extracter'), 
            "transporter": require("./creeps.transporter"), 
            "upgrader":require("./creeps.upgrader"), 
            "builder":require("./creeps.builder"),
            "fighter":require("./creeps.fighter")
        };
        
        // TODO: Maybe refresh creep?
        
        //if(creep.ticksToLive < 100){
        //    behaviours.recycle(creep);
        //    return;
        //}

        if(roles[creep.memory.roleId] != undefined)
            roles[creep.memory.roleId].run(creep);
        else
            console.log(creep.memory.roleId + " is not a role");
    }
};