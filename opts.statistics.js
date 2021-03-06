const STATISTICS_NUM_TICKS = 1000 * 2;

function writeTickToMemory(controller){
    controller.room.memory.statistics.lastTick = JSON.stringify({level: controller.level, progress: controller.progress});
}

function getAverage(){

}

let SHOW = false;

module.exports = {
    run: function(room) {
        if(room.controller.my){
            let c = room.controller;
            
            if(room.memory.statistics == undefined)
                room.memory.statistics = {};

            if(room.memory.statistics.lastTick == undefined)
                writeTickToMemory(c);

            if(room.memory.statistics.history == undefined)
                room.memory.statistics.history = [];

            if(room.memory.statistics.total == undefined)
                room.memory.statistics.total = 0;

            let lastTick = JSON.parse(room.memory.statistics.lastTick);

            if(lastTick.level == c.level){
                let diff = c.progress - lastTick.progress;

                let total = parseInt(room.memory.statistics.total);
                total += diff;

                //console.log(parseInt(room.memory.statistics.total))

                room.memory.statistics.history.unshift(diff);
                while(room.memory.statistics.history.length > STATISTICS_NUM_TICKS){
                    let removed = room.memory.statistics.history.pop();
                    total -= removed;
                }

                room.memory.statistics.total = total;

                if(SHOW){
                    let perTick = (total / STATISTICS_NUM_TICKS);
                    console.log("#####################################")
                    console.log("#####################################")
                    console.log("Progress: " + Math.round(c.progress / c.progressTotal * 100) + "%") 
                    console.log("Now:      " + diff + "/tick");
                    console.log("Last "+STATISTICS_NUM_TICKS+": " + perTick + "/tick");
                    console.log("Estimate eta: " + Math.round((c.progressTotal - c.progress) / perTick)/1000 + "k ticks");
                    console.log("Bucket: " + Game.cpu.bucket)
                    console.log("#####################################")
                    console.log("#####################################")
                }
            }
            writeTickToMemory(c);
        }
    }
};
