var oneIn = require('./opts.rnd');

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

function spawnOptimized(available, startAttributes, desirableAttributes, role, spawner){
    console.log("Spawning: " + role);
    
    let attributes = startAttributes;

    let i = 0;
    while(getAttributesCost(attributes) < available && attributes.length < 30){ // Maybe set limit to 50
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
        spawner.memory.enemies = spawner.room.find(FIND_HOSTILE_CREEPS).length + spawner.room.find(FIND_HOSTILE_SPAWNS).length;
        let existingConstructionSites = spawner.room.find(FIND_CONSTRUCTION_SITES).length;
        let resources = spawner.room.find(FIND_SOURCES);

        let maxExtracters = (spawner.room.energyCapacityAvailable < 600 ? resources.length * 2 : resources.length);
        let maxTransporters = (spawner.room.energyCapacityAvailable < 600 ? resources.length * 3 : resources.length * 2);
        let maxUpgrader = 2;
        
        let maxBuilder = 1 + (spawner.room.energyCapacityAvailable < 600 ? existingConstructionSites * 2 : existingConstructionSites);
        maxBuilder = Math.min(maxBuilder, 6);

        let maxFighter = 3 * spawner.memory.enemies + 1;

        console.log( "Creeps in room: " + '\n'
        + " Extracter: " + extracters.length + "/" + maxExtracters + '\n'
        + " Transporter: " + transporter.length + "/" + maxTransporters + '\n'
        + " Upgrader: " + upgrader.length + "/" + maxUpgrader + '\n'
        + " Builder: " + builder.length + "/" + maxBuilder + '\n'
        + " Fighter: " + fighter.length + "/" + maxFighter + '\n'
        );

        if(extracters.length > 0 && transporter.length > 0 && fighter.length < maxFighter) {
            spawnOptimized(available, [MOVE, ATTACK], [ATTACK, MOVE, TOUGH, TOUGH, TOUGH], 'fighter', spawner);
        }

        else if(extracters.length < maxExtracters && extracters.length <= transporter.length) {
            spawnOptimized(available, [MOVE, WORK], [WORK, WORK, WORK, MOVE], 'extracter', spawner);
        }

        else if(transporter.length < maxTransporters) {
            spawnOptimized(available, [MOVE, CARRY], [CARRY, MOVE], 'transporter', spawner);
        }

        else if(upgrader.length < maxUpgrader) {
            spawnOptimized(available, [MOVE, WORK, CARRY, MOVE], [WORK, WORK, MOVE], 'upgrader', spawner);
        }

        else if(builder.length < maxBuilder) {
            spawnOptimized(available, [MOVE, MOVE, WORK, CARRY], [CARRY, MOVE, WORK, WORK, MOVE], 'builder', spawner);
        }
    }
}

module.exports = {
    run: function(spawner){
        if(oneIn(16))
            checkSpawn(spawner);
    }
};