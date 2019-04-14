var oneIn = require('./opts.rnd');

function getAttributesCost(attrs){
    let costs = 0;
    for(let i = 0; i < attrs.length; i++)
        if(attrs[i] == MOVE || attrs[i] == CARRY)
            costs += 50;
        else if(attrs[i] == WORK)
            costs += 100;
        else if(attrs[i] == ATTACK)
            costs += 80;
        else if(attrs[i] == RANGED_ATTACK)
            costs += 150;
        else if(attrs[i] == HEAL)
            costs += 250;
        else if(attrs[i] == CLAIM)
            costs += 600;
        else if(attrs[i] == TOUGH)
            costs += 10;
            
    return costs;
}

function spawnOptimized(available, startAttributes, desirableAttribute, role, spawner){
    let attributes = startAttributes;
    while(getAttributesCost(attributes) < available)
        attributes.push(desirableAttribute);
    attributes.pop();

    if(spawner.memory["lastid"] == undefined)
        spawner.memory["lastid"] = 1;

    if(spawner.spawnCreep(attributes, "Nomad_" + spawner.memory["lastid"]++, {memory: {roleId: role}}) == 0){
        console.log("Spawned: " + attributes);
    }
}

module.exports = {
    run: function(spawner) {

        let maxUpgrader = 2;
        let maxBuilder = 2;
        let maxFighter = 3;
        
        let available = spawner.room.energyCapacityAvailable; 

        // This could be done in one loop
        var extracters = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'extracter');
        var transporter = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'transporter');
        var upgrader = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'upgrader');
        var builder = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'builder'); 
        var fighter = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'fighter'); 

        var resources = spawner.room.find(FIND_SOURCES)

        if(spawner.spawning == null)
        {
            if(spawner.memory.enemies == undefined || oneIn(10)){
                spawner.memory.enemies = spawner.room.find(FIND_HOSTILE_CREEPS).length + spawner.room.find(FIND_HOSTILE_SPAWNS).length;
            }

            if(extracters.length > 0 && transporter.length > 0 && spawner.memory.enemies > 1 && fighter.length < maxFighter) {
                spawnOptimized(available, [RANGED_ATTACK, MOVE], TOUGH, 'fighter', spawner); // Todo: That is not strong enough, make the variable paramter more complex :D
            }

            else if(extracters.length < resources.length * 2 && extracters.length <= transporter.length) {
                spawnOptimized(available, [WORK,WORK,MOVE], WORK, 'extracter', spawner);
            }

            else if(transporter.length < resources.length) {
                spawnOptimized(available, [CARRY,CARRY,MOVE], CARRY, 'transporter', spawner);
            }

            else if(upgrader.length < maxUpgrader) {
                spawnOptimized(available, [WORK,CARRY,MOVE], WORK, 'upgrader', spawner);
            }

            else if(builder.length < maxBuilder) {
                spawnOptimized(available, [WORK,CARRY,MOVE], WORK, 'builder', spawner);
            }
        }

        console.log("Extracter: " + extracters.length + "/" + resources.length * 2 + " | Transporter: " + transporter.length + "/" + resources.length + " | Upgrader: " + upgrader.length + "/" + maxUpgrader + " | Builder: " + builder.length + "/" + maxBuilder);
	}
};