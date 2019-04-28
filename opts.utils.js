module.exports = {
    logInform: function(msg) {
        console.log(msg);
    },
    
    logError: function(msg){
        console.log("Error: " + msg);
    },

    shuffle: function(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    },

    distance: function(p1, p2){
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    },

    dictToScoreSortedList: function(dict){
        let items = Object.keys(dict).map(function(key) {
            return [key, dict[key]];
        });

        // Sort the array based on the second element
        items.sort(function(first, second) {
            return second[1] - first[1];
        });

        return items;
    },

    isWalkable(pos){
        return pos.look().filter(s => (s.type == "structure" && s.structure.structureType != "road") || (s.type == "terrain" && s.terrain == "wall")).length == 0;
    },

    isWalkableAround(pos){
        for(let x = -1; x <= 1; x++){
            for(let y = -1; y <= 1; y++){
                if(x == 0 && y == 0)
                    continue;

                let candidate = new RoomPosition(pos.x + x, pos.y + y, pos.roomName);
                if(!module.exports.isWalkable(candidate)){
                    return false;
                }
            }
        }

        return true;
    },

    isInMap(x, y, border){
        return x < 50 - border && x > border && y < 50 - border && y > border;
    }
};