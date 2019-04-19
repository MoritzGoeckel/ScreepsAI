var utils = require('./opts.utils');

module.exports = {
    run: function(room) {
        utils.logInform("Checking tombstones");   
        room.find(FIND_TOMBSTONES).forEach(tombstone => {
            if(tombstone.creep.my) {
                console.log(`My creep died with ID=${tombstone.creep.id} ` +
                     `and role=${Memory.creeps[tombstone.creep.name].roleId}`);

                room.createFlag(tombstone.pos, "Danger", COLOR_RED);
                // Warn the others
            }    
        });
	}
};

/*
_.forEach(Game.rooms, room => {
    let eventLog = room.getEventLog();
    let attackEvents = _.filter(eventLog, {event: EVENT_ATTACK});
    attackEvents.forEach(event => {
        let target = Game.getObjectById(event.targetId);
        if(target && target.my) {
            console.log(event);
        }
    });
});
*/