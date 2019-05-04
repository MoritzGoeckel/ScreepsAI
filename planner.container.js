var utils = require('./opts.utils');
var constructionUtils = require('./planner.utils');

var oneIn = require('./opts.rnd');

module.exports = {
    run: function(room) {

        if(oneIn(151))
            constructionUtils.checkConstruction(room, room.controller.pos, STRUCTURE_CONTAINER, 2, 8);
        
        if(oneIn(153))
            constructionUtils.checkNearSpawns(room, STRUCTURE_STORAGE, 1, 8);

        if(oneIn(155))
            constructionUtils.checkNearSpawns(room, STRUCTURE_CONTAINER, 1, 8);

        // Why do I need containers near source. 
        //If I need them, then they have to be stocked by the extracter and be blacklisted for transporter
        //if(oneIn(157))
        //    constructionUtils.checkNearSources(room, STRUCTURE_CONTAINER, 1, 8);
	}
};