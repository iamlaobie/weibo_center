var util = require("util");
var EE = require("events").EventEmitter;
var async = require("async");
var _ = require("underscore");
var Account = require("../lib/account");
var handlers = require('../handlers');

var Worker = function(options) {
    var _self = this;
    var settings = options.settings;
    var dispatcher = require("../adapters").init(settings);
    this.prepare = function(task, callback) {
        if(!task.action) {
            var err = { msg: "unknow action" };
            callback(err, task);
            return;
        }

        if(!handlers[task.action]) {
            var err = { msg: 'can not handle this action' };
            callback(err, task);
            return;
        }
        task.handler = handlers[task.action];
        task.handler.prepare(task, callback);
    }

    this.exec = function(task, callback) {
        var apiAction = task.handler.apiAction;
        dispatcher.dispatch(task, function(err, body) {
            task.response = body;
            var error = err ? err.msg : null;
            callback(error, task);
        });
    }

    this.finish = function(task, callback) {
        task.handler.finish(task, function(err, task) {
            console.log(err, task);
            if(err) {
                console.log(err);
            }
            callback(err, task);
        });
    }

    this.work = function(task, queueCallback) {
        task.rawData = _.clone(task.data);
        var start = function(callback) {
            callback(null, task);
        }
        var funcs = [start, _self.prepare, _self.exec, _self.finish];
        async.waterfall(funcs, function(err) {
            if(err) {
                task.result = "error";
                task.err = err;
                _self.emit('error', err, task);
            } else {
                task.result = "success";
                _self.emit('finish', task);
            }
            queueCallback();
        });
    }
}
util.inherits(Worker, EE);
module.exports = Worker;