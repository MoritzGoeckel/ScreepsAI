var cleanup = require('./opts.cleanup');
var spawnerMgr = require('./spawner.default');
var creepMgr = require('./creeps.default');
var creepMgr = require('./creeps.default');

var Traveler = require('opts.Traveler');

var roadPlanner = require('./planner.road');
var extentionPlanner = require('./planner.extention');

var containerPlanner = require('./planner.container');

var oneIn = require('./opts.rnd');

Memory.resourceQueue = [];

module.exports.loop = function () {
    cleanup.run();

    for(var name in Game.creeps) {
        creepMgr.run(Game.creeps[name]);
    }

    for(var spawn in Game.spawns){
        if(oneIn(5))
            spawnerMgr.run(Game.spawns[spawn]);

        // Todo: Should be per room and not per spawn
        if(oneIn(12))
            roadPlanner.run(Game.spawns[spawn].room);

        if(oneIn(30))
            extentionPlanner.run(Game.spawns[spawn].room);
    }
}