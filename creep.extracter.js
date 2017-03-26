module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.assignedSource == undefined){
            var sources = creep.room.find(FIND_SOURCES);
            var extracters = _.filter(Game.creeps, (creep) => creep.memory.roleId == 'extracter' && creep.memory.assignedSource != undefined);

            let sourceExtracterCount = {};
            for(let s in sources){
                if(sourceExtracterCount[sources[s].id] == undefined)
                    sourceExtracterCount[sources[s].id] = 0;
            }

            for(let e in extracters){
                sourceExtracterCount[extracters[e].memory.assignedSource]++;
            }

            let lowestId = {id:undefined, count:99999999};
            for(let id in sourceExtracterCount)
            {
                if(sourceExtracterCount[id] < lowestId.count){
                    lowestId.count = sourceExtracterCount[id];
                    lowestId.id = id;
                }
            }
            
            creep.memory.assignedSource = lowestId.id;
            creep.say("Assigining resource: " + JSON.stringify(lowestId));
        }


        var assignedSource = Game.getObjectById(creep.memory.assignedSource);
        var result = creep.harvest(assignedSource);         
        if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(assignedSource.pos, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 1});
        }

        for(var resourceType in creep.carry) {
            creep.drop(resourceType);
        }

	    /*if(creep.carry.energy < creep.carryCapacity) {
        console.log(creep.carryCapacity);
            
        }
        else {
            
        }*/

	}
};