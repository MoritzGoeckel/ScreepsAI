var oneIn = require('./opts.rnd');

let DEFAULT_CLASSES = {
    extracter: {priority: 0, amount: 2}, // One per source
    transporter: {priority: 0, amount: 4}, // Depends on energy max
    builder: {priority: 11, amount: 1}, // Depends on construction sites
    upgrader: {priority: 12, amount: 3}, // Depends on energy and setting
    fighter: {priority: 0, amount: 0} // Depends on enemies
};

function putCreepToMaintain(blueprint, room){
    room.memory.creepsToMaintain[blueprint.role] = blueprint;
}

function setCreepToMaintainAmount(role, amount, room){ 
    room.memory.creepsToMaintain[role].amount = amount;
}

function initMemory(room){
    if(room.memory.creepsToMaintain == undefined){
        room.memory.creepsToMaintain = DEFAULT_CLASSES;
    }
}

module.exports = {
    run: function(room){
        initMemory(room);
                
        if(!oneIn(10))
            return;

        let existingConstructionSites = room.find(FIND_CONSTRUCTION_SITES).length;
        setCreepToMaintainAmount("builder", Math.max(existingConstructionSites, 3), room);

        let resources = room.find(FIND_SOURCES).length;
        setCreepToMaintainAmount("extracter", resources, room);

        //console.log(JSON.stringify(room.memory.creepsToMaintain))
    
        // Upgrader?
        // TODO: Calculate how many upgrader we need
        
        //let storage = spawner.pos.findClosestByRange(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}});
        //if(storage != null){
        //      let energyStock = storage.store[RESOURCE_ENERGY];
        //      upgraderPriceLimit = Math.max(energyStock / 30, standartEnergyLimit);
        //}

        //let existingTowers = spawner.room.find(FIND_MY_STRUCTURES, {filter: (i) => i.structureType == STRUCTURE_TOWER && i.energy > i.energyCapacity * 0.5}).length;

    },

    putCreepToMaintain: function(blueprint, room){
        putCreepToMaintain(blueprint, room);
    },

    getCreepsToMaintain: function(room){
        initMemory(room);
        return room.memory.creepsToMaintain;
    },

    setCreepToMaintainAmount: function(role, amount, room){ 
        setCreepToMaintainAmount(role, amount, room);
    }
}
