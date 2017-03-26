module.exports = {

    /** @param {Spawner} spawner **/
    run: function(spawner) {

        let maxUpgrader = 1;
        let maxBuilder = 2;
        

        var extracters = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'extracter');
        var transporter = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'transporter');
        var upgrader = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'upgrader');
        var builder = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'builder'); 

        var resources = spawner.room.find(FIND_SOURCES)

        //Say?

        if(spawner.spawning == null)
        {

            if(extracters.length < resources.length * 2) {
                spawner.createCreep([WORK,WORK,MOVE], undefined, {roleId: 'extracter'});
            }

            if(transporter.length < resources.length) {
                spawner.createCreep([CARRY,CARRY,MOVE], undefined, {roleId: 'transporter'});
            }

            if(upgrader.length < maxUpgrader) {
                spawner.createCreep([WORK,CARRY,MOVE], undefined, {roleId: 'upgrader'});
            }

            if(builder.length < maxBuilder) {
                spawner.createCreep([WORK,CARRY,MOVE], undefined, {roleId: 'builder'});
            }

        }

        console.log("Extracter: " + extracters.length + "/" + resources.length + " | Transporter: " + transporter.length + "/" + resources.length * 2 + " | Upgrader: " + upgrader.length + "/" + maxUpgrader + " | Builder: " + builder.length + "/" + maxBuilder);        

        //Game.rooms[roomName].createConstructionSite(10, 15, STRUCTURE_EXTENSION);

        //Count extensions
        /*var extensions = [];

        var sites = [];
        for(let id in Game.constructionSites)
        if(Game.constructionSites[id].my){
            sites.push(Game.constructionSites[id]);
            if(Game.constructionSites[id].structureType == STRUCTURE_EXTENSION)
                extensions.push(Game.constructionSites[id]);
        }*/
        

	}
};