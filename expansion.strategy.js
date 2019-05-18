var guidelines = require('./guidelines');

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
            // Create CLAIMER IN
            //supporting.room

            // Reserve CONTROLLER
            // Claim CONTROLLER
            // Maybe support with energy
            
            // Build SPAWN on green flag
            guidelines.setCenter(sink.pos, sink.room);
        }
        else{
            console.log("Incomplete flag pair");
        }
    }
}

module.exports = {

    // SUPPORTING => BLUE
    // SUPPORTED  => GREEN

    // DANGER     => RED

    run: function(){
        
        // NOT YET
        return;

        resolveFlagPairs();

        for(const r in Game.rooms) {
            let room = Game.rooms[r];
            //console.log(room) 
        } 
    }
}
