module.exports = {
    logInform: function(msg) {
        console.log(msg);
    },
    
    logError: function(msg){
        console.trace("Error: " + msg);
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
    }
};