function writeTickToMemory(controller){
    controller.room.memory.statistics_lastTick = JSON.stringify({level: controller.level, progress: controller.progress});
}

function getAverage(){

}

module.exports = {
    run: function(room) {
        if(room.controller.my){
            let c = room.controller;

            if(room.memory.statistics_lastTick == undefined)
                writeTickToMemory(c);

            if(room.memory.statistics_history == undefined)
                room.memory.statistics_history = [];

            if(room.memory.statistics_total == undefined)
                room.memory.statistics_total = 0;

            let lastTick = JSON.parse(room.memory.statistics_lastTick);

            if(lastTick.level == c.level){
                let diff = c.progress - lastTick.progress;

                let total = parseInt(room.memory.statistics_total);
                total += diff;

                //console.log(parseInt(room.memory.statistics_total))

                room.memory.statistics_history.unshift(diff);
                while(room.memory.statistics_history.length > 100){
                    let removed = room.memory.statistics_history.pop();
                    total -= removed;
                }

                room.memory.statistics_total = total;

                console.log("Now:      " + diff + "/tick");
                console.log("Last 100: " + (total / 100) + "/tick");

            }
            writeTickToMemory(c);
        }
    }
};