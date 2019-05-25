var behaviours = require('./creeps.behaviours');
var expansionMgr = require('./expansion.strategy');
var behaviours = require('./creeps.behaviours');
var voteomat = require('./opts.voteomat');

module.exports = {
    run: function(creep){
        
        if(creep.memory.home == creep.pos.roomName){
            // Still home
            
            // Get Resources
            //if(creep.carry.energy < creep.carryCapacity){
            //    behaviours.getEnergyFromSomewhere(creep);
            //    return;
            //}
            
            // Go to claimer relly point
            if(creep.memory.target == undefined){
                creep.memory.target = expansionMgr.getClaimerRellyPoint(creep.room);
            }        
        }

        if(creep.memory.target != undefined){ 
            let target = creep.memory.target;
            if(target.roomName != creep.pos.roomName){
                // Its a position / Lets go closer
                let pos = new RoomPosition(target.x, target.y, target.roomName); 
                creep.travelTo(pos, {visualizePathStyle: {stroke: '#ffaa00'}, maxRooms: 3});
                voteomat.voteRoad(creep);
            } else {
                // We are in the room
               
                if(creep.memory.spawnid == undefined || creep.memory.spawnid == null){
                    var site = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
                        filter: { structureType: STRUCTURE_SPAWN }
                    });
                    if(site != null){
                        creep.memory.spawnid = site.id;
                    }
                    else{
                        creep.memory.spawnid = null;
                    }
                    // If there is now spawn, just upgrade
                }
 
                // Maybe also upgrad controller if needed
                //    and deliver energy to spawn. Recycle after
                //    could try to keep using it. 
                //    But than I need to improve the code her a lot
            
                // Build spawn
                if(creep.carry.energy > 0 && creep.memory.sourceid == undefined){     
                    if(creep.memory.spawnid != null){
                        let site = Game.getObjectById(creep.memory.spawnid);
                        
                        //if(site == null){
                            // Spawn is done
                            //creep.suicide();
                        //}
    
                        if(creep.build(site) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(site.pos, {maxRooms: 1});
                            voteomat.voteRoad(creep);
                        }
                    }
                    else{
                        // Upgrade
                        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}, maxRooms: 1});
                            voteomat.voteRoad(creep);
                        }
                    }
                } else{
                    // Extract resources
                    if(creep.memory.sourceid == undefined){
                        let targetSource = creep.pos.findClosestByRange(FIND_SOURCES, {filter: function(source) {
                            return source.pos.findInRange(FIND_HOSTILE_CREEPS, 8).length == 0; 
                        }});
                        creep.memory.sourceid = targetSource.id;
                    }
                    
                    let source = Game.getObjectById(creep.memory.sourceid);
                    if(creep.harvest(source) == ERR_NOT_IN_RANGE){
                        creep.travelTo(source.pos, {maxRooms: 1});
                        voteomat.voteRoad(creep);
                    } 
                    if(creep.carry.energy == creep.carryCapacity)
                        delete creep.memory.sourceid;
                }
            }
        }
    }
}
