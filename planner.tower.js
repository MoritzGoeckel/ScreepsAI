var utils = require('./opts.utils');
var oneIn = require('./opts.rnd');
var constructionUtils = require('./planner.utils');

module.exports = {
    run: function(room) {

        //if(oneIn(163))
        //    constructionUtils.checkConstruction(room, room.controller.pos, STRUCTURE_TOWER);

        if(oneIn(160))
            constructionUtils.checkNearSpawns(room, STRUCTURE_TOWER, 5, 10); // TODO: As far away from each other as possible
	}
};