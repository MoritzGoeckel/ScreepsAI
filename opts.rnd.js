module.exports = function(oneIn){
    return Game.time % oneIn == 0;
};