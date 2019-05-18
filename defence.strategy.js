var creepsMgr = require('./manager.creeps');
var guidelines = require('./guidelines');

var oneIn = require('./opts.rnd');

module.exports = {
    run: function(room){        
        if(room.controller.safeMode == undefined){
            let hits = Math.max(room.controller.level - 2, 1) * 10 * 1000;
            guidelines.setMaxWallHitpoints(hits, room);
            guidelines.setMaxRampartHitpoints(hits, room);
        }

        let enemies = room.find(FIND_HOSTILE_CREEPS).length;
        creepsMgr.setCreepToMaintainAmount("fighter", enemies * 2, room);
        guidelines.setStayInside(enemies != 0, room);
    }
}
