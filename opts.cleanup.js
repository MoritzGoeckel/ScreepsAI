var utils = require('./opts.utils');
var oneIn = require('./opts.rnd');

function cleanup(){
    //utils.logInform("Starting cleanup");
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}

module.exports = {
    run: function() {
        if(oneIn(5))
            cleanup();
	}
};