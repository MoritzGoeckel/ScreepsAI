var cleanup = require('./opts.cleanup');
var spawnerMgr = require('./spawner.default');
var creepMgr = require('./creeps.default');

var Traveler = require('opts.Traveler');

var roadPlanner = require('./planner.road');
var nobuildPlanner = require('./planner.nobuild');

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
        spawnerMgr.run(Game.spawns[spawn]);
    }

    for(const r in Game.rooms) {
        roadPlanner.run(Game.rooms[r]);
        extentionPlanner.run(Game.rooms[r]);
        containerPlanner.run(Game.rooms[r]);
        nobuildPlanner.run(Game.rooms[r]);
    }
}