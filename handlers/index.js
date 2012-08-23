var fs = require('fs');
var handlers = {};
var files = fs.readdirSync(__dirname);
files.forEach(function(file) {
    if(!file.match(/\.js$/) || file == 'base.js' || file == 'index.js') {
        return;
    }
    var handler = file.replace(/\.js$/, '');
    handlers[handler] = require("./" + file);
});

module.exports = handlers;
