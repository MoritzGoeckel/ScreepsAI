// Version 18. May

var guidelines = require('./guidelines');

var cleanup = require('./opts.cleanup');
var spawnerMgr = require('./spawner.default');
var creepMgr = require('./creeps.default');

var Traveler = require('opts.Traveler');

var statisticsRunner = require('opts.statistics');

var roadPlanner = require('./planner.road');
var nobuildPlanner = require('./planner.nobuild');

var extentionPlanner = require('./planner.extention');

var containerPlanner = require('./planner.container');

var creepsMgr = require('./manager.creeps');
var towerPlanner = require('./planner.tower');
var wallsPlanner = require('./planner.walls');

var towersBehaviour = require('./defence.tower');
var defence = require('./defence.strategy');

var oneIn = require('./opts.rnd');
var claimMgr = require('./opts.claimmgr');

var constructionUtils = require('./planner.utils');
var expansionMgr = require('./expansion.strategy');

Memory.resourceQueue = [];

// TODO LIST
// * Regulate the amount of upgrading / storing
// * Claiming other rooms
// * Have dedicated transport creeps for spawner / extensions
// * Tune price limits
// * Have container for sources. Blacklist them. Let them be filled only by extracters
// * Base umfang in config

module.exports.loop = function () {
    cleanup.run();

    expansionMgr.run(); 

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
        towerPlanner.run(Game.rooms[r]);
        wallsPlanner.run(Game.rooms[r]);

        statisticsRunner.run(Game.rooms[r]);

        towersBehaviour.run(Game.rooms[r]);
        defence.run(Game.rooms[r]);

        creepsMgr.run(Game.rooms[r]);

        //Debugging purpose
        //constructionUtils.drawPattern(Game.rooms[r]);

        //Game.rooms[r].visual.circle(25, 25, {fill: 'transparent', radius: 5, stroke: 'orange'});
    }

    if(oneIn(30))
        console.log("Bucket: " + Game.cpu.bucket)

    claimMgr.run();
}
