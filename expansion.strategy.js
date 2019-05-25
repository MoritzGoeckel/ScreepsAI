var guidelines = require('./guidelines');
var oneIn = require('./opts.rnd');

var creepsManager = require('./manager.creeps');

// TODO: Reserve CONTROLLER
// TODO: Maybe support with energy           

function resolveFlagPairs(){
    let pairs = {};

    for(const f in Game.flags){
        let flag = Game.flags[f];

        if(pairs[flag.secondaryColor] == undefined)
            pairs[flag.secondaryColor] = {sink: null, source: null};

        if(flag.color == COLOR_BLUE)
            pairs[flag.secondaryColor].source = flag;

        if(flag.color == COLOR_GREEN)
            pairs[flag.secondaryColor].sink = flag;
    }

    for(let col in pairs){
        let pair = pairs[col];
        if(pair.sink != null && pair.source != null){
            // Tell room to create claimers
            creepsManager.setCreepToMaintainAmount("claimer", 1, pair.source.room);
            
            // Set relly point
            setClaimerRellyPoint(pair.sink.pos, pair.source.room);
 
            // Build SPAWN on green flag
            if(pair.sink.room != undefined){
                guidelines.setCenter(pair.sink.pos, pair.sink.room);
                
                if(pair.sink.room.find(FIND_MY_STRUCTURES, 
                    {filter: {structureType: STRUCTURE_SPAWN}}).length > 0) 
                {
                    // Spawn exists 
                    creepsManager.setCreepToMaintainAmount("pioneer", 0, pair.source.room);
                    creepsManager.setCreepToMaintainAmount("claimer", 0, pair.source.room);
                    setClaimerRellyPoint(null, pair.source.room);
                    
                    pair.sink.remove();
                    pair.source.remove();
                    continue;
                }
                else if(pair.sink.room.controller.my){
                    creepsManager.setCreepToMaintainAmount("claimer", 0, pair.source.room);
                    
                    // Destruct abandoned spawn
                    let other_spawns = pair.sink.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}});
                    if(other_spawns != null){
                        for(let s in other_spawns){
                            if(other_spawns[s].my == false){
                                let result = other_spawns[s].destroy();
                                console.log("Removing enemy spawn: " + result);
                            }
                        }
                    }
                    
                    // Construct spawn
                    let result = pair.sink.pos.createConstructionSite(STRUCTURE_SPAWN);
                    //if(result == -14){
                    //    console.log("Cant build spawn because of rcl")
                    //}
                    
                    // Request pioneer
                    creepsManager.setCreepToMaintainAmount("pioneer", 4, pair.source.room);
                }
            }
        }
        else{
            console.log("Incomplete flag pair");
        }
    }
}

function setClaimerRellyPoint(pos, room){
    room.memory.claimerRellyPoint = JSON.stringify(pos);
}

module.exports = {

    // SUPPORTING => BLUE
    // SUPPORTED  => GREEN

    // DANGER     => RED

    getClaimerRellyPoint: function(room){
        let target = JSON.parse(room.memory.claimerRellyPoint); 
        return new RoomPosition(target.x, target.y, target.roomName);
    },

    run: function(){
        //if(!oneIn(30))
        //    return;

        resolveFlagPairs();

        //for(const r in Game.rooms) {
            //let room = Game.rooms[r];
            //console.log(room) 
        //} 
    }
}
