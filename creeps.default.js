var utils = require('./opts.utils');
var behaviours = require('./creeps.behaviours');

var guidelines = require('./guidelines');

module.exports = {
    run: function(creep) {
        var roles = {
            "extracter": require('./creeps.extracter'), 
            "transporter": require("./creeps.transporter"), 
            "upgrader":require("./creeps.upgrader"), 
            "builder":require("./creeps.builder"),
            "fighter":require("./creeps.fighter"),
            "claimer":require("./creeps.claimer"),
            "pioneer":require("./creeps.pioneer")
        };
        
        // TODO: Maybe refresh creep?
        
        //if(creep.ticksToLive < 100){
        //    behaviours.recycle(creep);
        //    return;
        //}

        if(roles[creep.memory.roleId] != "fighter" && guidelines.getStayInside(creep.room)){
            let busy = behaviours.goIntoSafety(creep);
            
            if(busy){
                delete creep.memory.target; // generally used for most roleId's
                return;
            }
        }

        if(roles[creep.memory.roleId] != undefined)
            roles[creep.memory.roleId].run(creep);
        else
            console.log(creep.memory.roleId + " is not a role");
    }
};
