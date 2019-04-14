let maximum = 2; 
let spread = 5;

module.exports = {
    run: function(room) {
        let existingSitesList = room.find(FIND_MY_CONSTRUCTION_SITES); 

        existingSitesList = existingSitesList.filter(function(site) {
            return site.structureType == STRUCTURE_EXTENSION;
        });

        let existingSites = existingSitesList.length;

        if(existingSites >= maximum)
            return;

        let spawns = room.find(FIND_MY_SPAWNS);
        if(spawns.length == 0){
            console.log("No spawn found to build extention");
            return;
        }

        while(existingSites < maximum){
            let spawn = spawns[Math.floor(spawns.length * Math.random())];
            let x = spawn.pos.x + Math.floor(Math.random() * spread);
            let y = spawn.pos.y + Math.floor(Math.random() * spread);

            const pos = new RoomPosition(x, y, room.name);
            if(pos.createConstructionSite(STRUCTURE_EXTENSION) == 0){
                existingSites++;
            }
        }        
	}
};