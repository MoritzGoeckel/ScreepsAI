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
    while(getAttributesCost(attributes) < available){
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

    let maxUpgrader = 4;
    let maxBuilder = 3;
    let maxFighter = 3;
    
    let available = spawner.room.energyAvailable; //energyCapacityAvailable
    
    if(available < 300)
        return;

    //console.log("Spawn energy: " + spawner.energy);
    //console.log("Room energy: " + spawner.room.energyAvailable);

    // This could be done in one loop
    var extracters = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'extracter');
    var transporter = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'transporter');
    var upgrader = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'upgrader');
    var builder = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'builder'); 
    var fighter = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'fighter'); 

    var resources = spawner.room.find(FIND_SOURCES)

    let existingExtensions = spawner.room.find(FIND_STRUCTURES).filter(function(structure) {
        return structure.structureType == STRUCTURE_EXTENSION;
    }).length;

    if(extracters.length > 0 && transporter.length > 0 && spawner.room.energyAvailable < existingExtensions * 50)
        return; // Only when all extensions are full

    if(spawner.spawning == null)
    {
        //if(spawner.memory.enemies == undefined){ // TODO: OneIn does only work in main. Second layer would need memory.
        spawner.memory.enemies = spawner.room.find(FIND_HOSTILE_CREEPS).length + spawner.room.find(FIND_HOSTILE_SPAWNS).length;
        //}

        if(extracters.length > 0 && transporter.length > 0 && spawner.memory.enemies > 0 && fighter.length < maxFighter) {
            spawnOptimized(available, [MOVE, ATTACK], [ATTACK, MOVE, TOUGH, TOUGH, TOUGH], 'fighter', spawner);
        }

        else if(extracters.length < resources.length * 2 && extracters.length <= transporter.length) {
            spawnOptimized(available, [MOVE, WORK], [WORK, WORK, WORK, MOVE], 'extracter', spawner);
        }

        else if(transporter.length < resources.length * 2) {
            spawnOptimized(available, [MOVE, CARRY], [CARRY, MOVE], 'transporter', spawner);
        }

        else if(upgrader.length < maxUpgrader) {
            spawnOptimized(available, [MOVE, WORK, CARRY, MOVE], [WORK, WORK, MOVE], 'upgrader', spawner);
        }

        else if(builder.length < maxBuilder) {
            spawnOptimized(available, [MOVE, MOVE, WORK, CARRY], [CARRY, MOVE, WORK, WORK, MOVE], 'builder', spawner);
        }
    }

    console.log("Extracter: " + extracters.length + "/" + resources.length * 2 + " | Transporter: " + transporter.length + "/" + resources.length + " | Upgrader: " + upgrader.length + "/" + maxUpgrader + " | Builder: " + builder.length + "/" + maxBuilder);
}

module.exports = {
    run: function(spawner){
        if(oneIn(16))
            checkSpawn(spawner);
    }
};