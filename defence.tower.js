var utils = require('./opts.utils');

function repair(tower){
    // Maybe not the closest, but the most damaged (least health points)
    
    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => 
        s.hits < s.hitsMax * 0.9
        && utils.distance(s.pos, tower.pos) < 100 // Should also repair far structures
        && s.structureType != STRUCTURE_ROAD
        && ((s.structureType != STRUCTURE_WALL 
            && s.structureType != STRUCTURE_RAMPART)
            || s.hits < 10 * 1000) // Rampart and wall max
    });
    
    if(closestDamagedStructure) {
         tower.repair(closestDamagedStructure);
         return true;
    }
    else
        return false;
}

function heal(tower){
    // TODO: Healing
    /*for (let name in Game.creeps) {
        // get the creep object
        var creep = Game.creeps[name];
        if (creep.hits < creep.hitsMax) {
            towers.forEach(tower => tower.heal(creep));
            console.log("Tower is healing Creeps.");
        }
    }*/        
}

function defend(tower){
    var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (target != undefined) {
        tower.attack(target);
        return true;
    }
    else
        return false;
}

module.exports = {

    run: function(room){
        var towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        for(let t in towers){
            let tower = towers[t];
            
            if(defend(tower))
                continue;
            
            if(tower.energy > tower.energyCapacity * 0.65 && repair(tower))
                continue;
            
            heal(tower);
        }
    }
};
