var oneIn = require('./opts.rnd');

var guidelines = require('./guidelines');

function getAttributesCost(attrs){
    let costs = 0;
    for(let i = 0; i < attrs.length; i++)
        if(attrs[i] == MOVE)
            costs += BODYPART_COST["move"];
        else if (attrs[i] == CARRY)
            costs += BODYPART_COST["carry"];
        else if(attrs[i] == WORK)
            costs += BODYPART_COST["work"];
        else if(attrs[i] == ATTACK)
            costs += BODYPART_COST["attack"];
        else if(attrs[i] == RANGED_ATTACK)
            costs += BODYPART_COST["ranged_attack"];
        else if(attrs[i] == HEAL)
            costs += BODYPART_COST["heal"];
        else if(attrs[i] == CLAIM)
            costs += BODYPART_COST["claim"];
        else if(attrs[i] == TOUGH)
            costs += BODYPART_COST["tough"];
            
    return costs;
}

function spawnOptimized(available, startAttributes, desirableAttributes, role, spawner, energyLimit){
    console.log("Spawning: " + role);
    
    let attributes = startAttributes;

    let i = 0;
    while(getAttributesCost(attributes) < available 
    && attributes.length < 30 // Maybe set limit to 50 
    && getAttributesCost(attributes) < energyLimit) // Dont spawn too expensive creeps
    { 
        attributes.push(desirableAttributes[i % desirableAttributes.length]);
        i++;
    }
    attributes.pop();

    if(spawner.memory["lastid"] == undefined)
        spawner.memory["lastid"] = 1;
    
    let result = spawner.spawnCreep(attributes, "Nomad_" + spawner.memory["lastid"]++, {memory: {roleId: role}});
    if(result == 0){
        console.log("Spawned: " + attributes);
    }
    else{
        console.log("Spawn not possible, reason: " + result + " with " + attributes);
    }
}

const EXTENSION_SIZE = 50;

let maintainedClasses = [
    {role: "extracter", priority: 0, amount: 2}, // One per source
    {role: "transporter", priority: 1, amount: 4}, // Depends on energy max
    {role: "builder", priority: 2, amount: 1}, // Depends on construction sites
    {role: "upgrader", priority: 2, amount: 1}, // Depends on energy and setting
    {role: "fighter", priority: 0, amount: 0} // Depends on enemies
];

function checkSpawn(spawner) {    
    let available = spawner.room.energyAvailable; //energyCapacityAvailable
    
    if(available < 300)
        return;

    //console.log("Spawn energy: " + spawner.energy);
    //console.log("Room energy: " + spawner.room.energyAvailable);

    // This could be done in one loop
    let extracters = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'extracter');
    let transporter = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'transporter');
    let upgrader = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'upgrader');
    let builder = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'builder'); 
    let fighter = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'fighter'); 

    if(extracters.length > 0 && transporter.length > 0 && spawner.room.energyAvailable < spawner.room.energyCapacityAvailable)
        return; // Only when all extensions are full

    if(spawner.spawning == null)
    {
        let existingConstructionSites = spawner.room.find(FIND_CONSTRUCTION_SITES).length;
        let resources = spawner.room.find(FIND_SOURCES);

        let existingTowers = spawner.room.find(FIND_MY_STRUCTURES, {filter: (i) => i.structureType == STRUCTURE_TOWER && i.energy > i.energyCapacity * 0.5}).length;
        
        let storage = spawner.pos.findClosestByRange(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}});

        let maxExtracters = resources.length;
        let maxTransporters = (spawner.room.energyCapacityAvailable < 600 ? resources.length * 3 : resources.length * 2);
        let maxUpgrader = 3;
        
        let maxBuilder = 1 + (spawner.room.energyCapacityAvailable < 600 ? existingConstructionSites * 2 : existingConstructionSites);
        maxBuilder = Math.min(maxBuilder, 6); 

        let maxFighter = guidelines.getRequiredFighters(spawner.room);

        console.log( "Creeps in room: " + '\n'
        + " Extracter: " + extracters.length + "/" + maxExtracters + '\n'
        + " Transporter: " + transporter.length + "/" + maxTransporters + '\n'
        + " Upgrader: " + upgrader.length + "/" + maxUpgrader + '\n'
        + " Builder: " + builder.length + "/" + maxBuilder + '\n'
        + " Fighter: " + fighter.length + "/" + maxFighter + '\n'
        );

        let standartEnergyLimit = 14 * EXTENSION_SIZE;

        if(extracters.length > 0 && transporter.length > 0 && fighter.length < maxFighter) {
            spawnOptimized(available, [MOVE, ATTACK], [ATTACK, MOVE, TOUGH, TOUGH, TOUGH], 'fighter', spawner, standartEnergyLimit);
        }

        else if(extracters.length < maxExtracters && extracters.length <= transporter.length) {
            let extracterEnergyLimit = 14 * EXTENSION_SIZE;
            spawnOptimized(available, [MOVE, WORK], [WORK, WORK, WORK, MOVE], 'extracter', spawner, extracterEnergyLimit); // 14 * EXTENSION_SIZE is perfect
        }

        else if(transporter.length < maxTransporters) {
            let transporterEnergyLimit = 20 * EXTENSION_SIZE;
            spawnOptimized(available, [MOVE, CARRY], [CARRY, MOVE], 'transporter', spawner, transporterEnergyLimit);
        }

        else if(upgrader.length < maxUpgrader) {
            let upgraderPriceLimit = standartEnergyLimit;
            if(storage != null){
                let energyStock = storage.store[RESOURCE_ENERGY];
                upgraderPriceLimit = Math.max(energyStock / 30, standartEnergyLimit);
            }
            spawnOptimized(available, [MOVE, WORK, CARRY, MOVE], [WORK, WORK, WORK, CARRY, MOVE], 'upgrader', spawner, upgraderPriceLimit);
        }

        else if(builder.length < maxBuilder) {
            spawnOptimized(available, [MOVE, MOVE, WORK, CARRY], [CARRY, MOVE, WORK, WORK, MOVE], 'builder', spawner, standartEnergyLimit);
        }
    }
}

module.exports = {
    run: function(spawner){
        if(oneIn(16))
            checkSpawn(spawner);
    }
};
