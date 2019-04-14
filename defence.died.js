module.exports = {
    run: function(room) {
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