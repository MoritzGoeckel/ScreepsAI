var _ = require('lodash');
var utils = require('./opts.utils');

module.exports = {
    voteRoad: function(creep){
        if(creep.room.memory.roadvotes == undefined){
            creep.room.memory.roadvotes = {};
            creep.room.memory.roadvotesTotal = 0;
        }

        let pos = JSON.stringify({x: creep.pos.x, y: creep.pos.y});
        if(creep.room.memory.roadvotes[pos] == undefined)
            creep.room.memory.roadvotes[pos] = 0;

        creep.room.memory.roadvotes[pos]++;
        creep.room.memory.roadvotesTotal++;
    }
};