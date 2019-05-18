var oneIn = require('./opts.rnd');
var creepsManager = require('./manager.creeps');

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
   
    let id = parseInt(spawner.memory["lastid"]);
    spawner.memory["lastid"] = id + 1;
    let result = spawner.spawnCreep(attributes, "Nomad_" + id + "_" + role, {memory: {roleId: role, home: spawner.room.name}});
    if(result == 0){
        console.log("Spawned: " + attributes);
    }
    else{
        console.log("Spawn not possible, reason: " + result + " with " + attributes);
    }
}

const EXTENSION_SIZE = 50;
const STANDART_ENERGY_LIMIT = 14 * EXTENSION_SIZE;

const CLASS_BLUEPRINTS = {
    fighter: {baseParts: [MOVE, ATTACK], additionalParts: [ATTACK, MOVE, TOUGH, TOUGH, TOUGH], priceLimit: STANDART_ENERGY_LIMIT},
    extracter: {baseParts: [MOVE, WORK], additionalParts: [WORK, WORK, WORK, MOVE], priceLimit: 14 * EXTENSION_SIZE},
    transporter: {baseParts: [MOVE, CARRY], additionalParts: [CARRY, MOVE], priceLimit: 20 * EXTENSION_SIZE},
    upgrader: {baseParts: [MOVE, WORK, CARRY, MOVE], additionalParts: [WORK, WORK, WORK, CARRY, MOVE], priceLimit: STANDART_ENERGY_LIMIT},
    builder: {baseParts: [MOVE, MOVE, WORK, CARRY], additionalParts: [CARRY, MOVE, WORK, WORK, MOVE], priceLimit: STANDART_ENERGY_LIMIT},
    claimer: {baseParts: [MOVE, CLAIM], additionalParts: [MOVE, CLAIM], priceLimit: 99999},
    pioneer: {baseParts: [MOVE, MOVE, WORK, CARRY], additionalParts: [MOVE, MOVE, WORK, CARRY], priceLimit: 20 * EXTENSION_SIZE}
}

function checkSpawn(spawner) {    
    if(spawner.spawning != null)
        return;

    let available = spawner.room.energyAvailable; //energyCapacityAvailable
    
    if(available < 300)
        return;

    let maintainedClasses = creepsManager.getCreepsToMaintain(spawner.room);

    let candidate = {priority: 99999, existing: 99999, isdummy: true};

    let keys = Object.keys(maintainedClasses);
    for(let i in keys) {
        let role = keys[i];
        let entry = maintainedClasses[role];

        let existing = _.filter(Game.creeps, (creep) => creep.memory.roleId == role && creep.memory.home == spawner.room.name).length;

        if(entry.amount > existing 
        && (entry.priority < candidate.priority 
           || (entry.priority == candidate.priority && existing < candidate.existing))){
            candidate = entry;
            candidate.role = role;
            candidate.existing = existing;
        }
    }

    if(candidate.isdummy == true)
        return;

    if(candidate.priority >= 10 && spawner.room.energyAvailable < spawner.room.energyCapacityAvailable)
        return; // Only when all extensions are full

    console.log(JSON.stringify(candidate));
   
    let blueprint = CLASS_BLUEPRINTS[candidate.role];
    if(blueprint == undefined){
        console.log("Role " + candidate.role + " not found in blueprints");
        return;
    }

    spawnOptimized(available, blueprint.baseParts, blueprint.additionalParts, candidate.role, spawner, blueprint.priceLimit);
}

module.exports = {
    run: function(spawner){
        if(oneIn(16))
            checkSpawn(spawner);
    }
};
