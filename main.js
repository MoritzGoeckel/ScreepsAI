var roles = {"extracter": require('creep.extracter'), "transporter": require("creep.transporter"), "upgrader":require("creep.upgrader"), "builder":require("creep.builder")};
var cleanup = require('always.cleanup');
var spawnerFirst = require('spawner.first');

Memory.resourceQueue = [];

module.exports.loop = function () {

    cleanup.run();

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        
        if(roles[creep.memory.roleId] != undefined)
            roles[creep.memory.roleId].run(creep);
        else
            console.log(creep.memory.roleId + " is not a role");
    }

    for(var spawn in Game.spawns){
        spawnerFirst.run(Game.spawns[spawn]);
    }
    
}