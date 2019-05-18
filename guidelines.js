function getWithDefault(name, def, room){
    if(room.memory.guidelines == undefined || room.memory.guidelines[name] == undefined){
        return def;
    }
    return room.memory.guidelines[name];
}

function set(name, value, room){
    if(room.memory.guidelines == undefined){
        room.memory.guidelines = {};
        console.log("Creating guidelines")
    }
    room.memory.guidelines[name] = value;
}

module.exports = {

    setMaxRampartHitpoints: function(value, room){
       set("MAX_RAMPART", value, room); 
    },
    
    setMaxWallHitpoints: function(value, room){
        set("MAX_WALL", value, room); 
    },
    
    getMaxRampartHitpoints: function(room){
        return getWithDefault("MAX_RAMPART", 10 * 1000, room);
    },

    getMaxWallHitpoints: function(room){
        return getWithDefault("MAX_WALL", 10 * 1000, room);
    },

    getUpperRepairThreshold: function(room){
        return 1.2;
    },
    
    getLowerRepairThreshold: function(room){
        return 0.9;
    },

    getRequiredFighters: function(room){
        return getWithDefault("MAX_FIGHTERS", 0, room);
    },
    
    setRequiredFighters: function(value, room){
        set("MAX_FIGHTERS", value, room); 
    },

    getStayInside: function(room){
        return getWithDefault("STAY_INSIDE", 0, room);
    },
    
    setStayInside: function(value, room){
        set("STAY_INSIDE", value, room); 
    },

    setCenter: function(value, room){
        set("CENTER", {x: value.x, y: value.y}, room); 
    },

    getCenter: function(room){
        let out = getWithDefault("CENTER", null, room);
        if(out == null){
            let spawns = room.find(FIND_MY_SPAWNS);
            if(spawns.length != 1){
                console.log("There should be exactly one spawn. Cant set center!");
                return null;
            }
            module.exports.setCenter(spawns[0].pos, room)
        }
        else{
            return new RoomPosition(out.x, out.y, room.name);
        }
    }
}
