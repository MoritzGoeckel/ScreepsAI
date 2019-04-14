var oneIn = require('./opts.rnd');

module.exports = {
    
    run: function(creep) {

        // Ranged
        const closeTargets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
        if(closeTargets.length > 0) {
            creep.rangedMassAttack();
        }

        // Maybe should operate in groups
        if(creep.memory.hostileTarget == undefined && oneIn(30)){

            var fighter = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'fighter'); 
            if(fighter.length < 3) // Only fight in packs
                return;

            var targets = creep.room.find(FIND_HOSTILE_CREEPS);
            if(targets.length == 0)
                targets = creep.room.find(FIND_HOSTILE_SPAWNS);

            if(targets.length == 0)
                targets = creep.room.find(FIND_HOSTILE_STRUCTURES);

            if(targets.length != 0)
                creep.memory.hostileTarget = targets[0].id;
        }
        else
        {
            var target = Game.getObjectById(creep.memory.hostileTarget);
            if(target) {
                // Close
                if(creep.attack(target) != OK) {
                    creep.travelTo(target);
                }
            }
        }
	}
};