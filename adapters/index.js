var fs = require('fs');
var util = require("util");
var EE = require("events").EventEmitter;
var Manager = function(settings) {
    var _self = this;
    this.adapters = {};

    var files = fs.readdirSync(__dirname);
    files.forEach(function(file) {
        if(!file.match(/\.js$/) || file == 'index.js' || file == 'base.js') {
            return;
        }
        var adapter = file.replace(/\.js$/, '');
        var AdapterConstructor = require("./" + file);
        _self.adapters[adapter.toLowerCase()] = new AdapterConstructor({ settings: settings });
    });

    this.getAdapter = function(name) {
        return this.adapters[name];
    };

    this.getAdapters = function() {
        return this.adapters;
    };

    this.dispatch = function(task, callback) {
        var adapter = this.getAdapter(task.account.provider);
        if(!adapter[task.action]) {
            callback({ msg: "the account no support this action" }, task);
        } else {
            adapter[task.action](task, function(err, task) {
                if(!err) {
                    task.result = 'SUCCESS';
                }
                console.log(task);
                callback(err, task);
            });
        }
    };
}
util.inherits(Manager, EE);

module.exports.init = function(settings) {
    return new Manager(settings);
}