var utils = require('./opts.utils');
var constructionUtils = require('./planner.utils');

var oneIn = require('./opts.rnd');

module.exports = {
    run: function(room) {

        if(oneIn(151))
            constructionUtils.checkConstruction(room, room.controller.pos, STRUCTURE_CONTAINER, 1, 5);
        
        if(oneIn(153))
            constructionUtils.checkNearSpawns(room, STRUCTURE_STORAGE, 1, 6);
        //constructionUtils.checkConstruction(room, room.controller.pos, STRUCTURE_STORAGE, 1, 7);

        if(oneIn(155))
            constructionUtils.checkNearSpawns(room, STRUCTURE_CONTAINER, 1, 5);

        if(oneIn(157))
            constructionUtils.checkNearSources(room, STRUCTURE_CONTAINER, 1, 5);
	}
};