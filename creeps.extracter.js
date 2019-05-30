var utils = require('./opts.utils');
var voteomat = require('./opts.voteomat');
var _ = require('lodash');
var behaviours = require('./creeps.behaviours');

module.exports = {
    run: function(creep) {

        // TODO: Build container
        // TODO: Always stay on container

        if(creep.memory.target == undefined){
            var extracters = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'extracter' && creep.memory.target != undefined);

            // This should check if the flag is actually red
            // && source.pos.findInRange(FIND_FLAGS, 8).length == 0

            let sources = creep.room.find(FIND_SOURCES).filter(function(source) {
                return source.pos.findInRange(FIND_HOSTILE_CREEPS, 8).length == 0; 
            });

            let sourceExtracterCount = {};
            for(let s in sources){
                if(sourceExtracterCount[sources[s].id] == undefined)
                    sourceExtracterCount[sources[s].id] = 0;
            }

            for(let e in extracters){
                sourceExtracterCount[extracters[e].memory.target]++;
            }

            let lowestId = {id:undefined, count:99999999};
            for(let id in sourceExtracterCount)
            {
                if(sourceExtracterCount[id] < lowestId.count){
                    lowestId.count = sourceExtracterCount[id];
                    lowestId.id = id;
                }
            }
            
            creep.memory.target = lowestId.id;
        }

        var assignedSource = Game.getObjectById(creep.memory.target);
        var result = creep.harvest(assignedSource);
        if(result == ERR_NOT_IN_RANGE) {
            voteomat.voteRoad(creep);
            creep.travelTo(assignedSource.pos, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 1});
        }

        if(creep.carryCapacity != 0 && _.sum(creep.carry) == creep.carryCapacity){
            if(behaviours.bringResourcesToContainers(creep, 3) == false)
                behaviours.dropEverything(creep);
        }
	}
};
