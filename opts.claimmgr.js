var utils = require('./opts.utils');
var oneIn = require('./opts.rnd');

module.exports = {

    run: function(){
        if(oneIn(33))
            module.exports.cleanup();
        
        module.exports.draw();
    },

    cleanup: function(){
        if(Memory.transportClaims == undefined){
            Memory.transportClaims = {};
        }

        let keys = Object.keys(Memory.transportClaims);
        for(let k in keys){ 
            let object = Game.getObjectById(keys[k]);
            if(object == null){
                delete Memory.transportClaims[keys[k]];
            } else {
                let existing = Memory.transportClaims[keys[k]].filter(
                    entry => { 
                        return Game.getObjectById(JSON.parse(entry.creep)) != null; 
                    }
                );
               
                let diff = existing.length - Memory.transportClaims[keys[k]].length;
                if(diff < 0)
                    console.log("Removing creeps from transport claims: " + diff);
 
                Memory.transportClaims[keys[k]] = existing;
            }
        } 
    },

    draw: function(){
        if(Memory.transportClaims == undefined){
            return;
        }

        let keys = Object.keys(Memory.transportClaims);
        for(let k in keys){ 
            let object = Game.getObjectById(keys[k]);
            if(object != null){
               // Get amout
                let amount = object.amount;
                if(amount == undefined){
                    amount = object.store[RESOURCE_ENERGY];
                } 
                let claimed = module.exports.claimedAmount(object.id);
                let claimedNum = module.exports.claimedNum(object.id);
                object.room.visual.text("C" + claimed + "/" + amount + " (" + claimedNum + ")", 
                                        object.pos.x, object.pos.y, {color: 'white', font: 0.8});
            }
        }

    },

    claimTransport: function(creep, pickupPointId){
        const amount = creep.carryCapacity - _.sum(creep.carry);
        if(Memory.transportClaims == undefined){
            Memory.transportClaims = {}; 	
        }
        if(Memory.transportClaims[pickupPointId] == undefined){
            Memory.transportClaims[pickupPointId] = [];
        }
        Memory.transportClaims[pickupPointId].push({"creep":JSON.stringify(creep.id), "amount":amount});
    },

    unclaimTransport: function(creep, pickupPointId){
        if(Memory.transportClaims == undefined){
            return;
        }
        if(Memory.transportClaims[pickupPointId] == undefined){ 
            return;
        }

        // Remove the element with the same creep id
        for(var i = Memory.transportClaims[pickupPointId].length - 1; i >= 0; i--) {
            if(Memory.transportClaims[pickupPointId][i].creep == JSON.stringify(creep.id)) {
                Memory.transportClaims[pickupPointId].splice(i, 1);
            }
        }

        // If empty, remove
        if(Memory.transportClaims[pickupPointId].length == 0)
            delete Memory.transportClaims[pickupPointId];
    },

    claimedAmount: function(pickupPointId){
        if(Memory.transportClaims == undefined){
            return 0;
        }

        if(Memory.transportClaims[pickupPointId] == undefined){ 
            return 0;
        }

        let sum = 0;
        Memory.transportClaims[pickupPointId].map(e => sum += e.amount);
        
        return sum;
    },
    
    claimedNum: function(pickupPointId){
        if(Memory.transportClaims == undefined){
            return 0;
        }

        if(Memory.transportClaims[pickupPointId] == undefined){ 
            return 0;
        }

        return Memory.transportClaims[pickupPointId].length;
    },
}
