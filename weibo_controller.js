var settings = require("./etc/settings.json");
var tool = require("./lib/tool");
var Queue = require('./lib/queue').Queue;
var handlers = require('./handlers');
var async = require('async');
var redis = require("redis");
var redisClient = redis.createClient(settings.redis.port, settings.redis.host);
redisClient.select(settings.redis.db);
var runLogger = require('./lib/logger').logger("run.log");

var mysql = require("mysql");
var mysqlCli = mysql.createClient(settings.mysql);

//task queue
var taskQueue = new Queue(settings.taskQueue.name, redisClient);
var reportQueue = new Queue(settings.reportQueue.name, redisClient);

//将任务分发到不通的微博平台
var dispatcher = require("./adapters").init(settings);

var taskError = function(err, task) {
    var handler = handlers[task.action];
    var deal = handler.error(err, task);
    if(deal == 'delay' && task.retry < settings.retry) {
        setTimeout(function() {
            task.retry += 1;
            taskQueue.push(task);
        }, 60000);
    } else if(deal == 'retry' && task.retry < settings.retry) {
        task.retry += 1;
        taskQueue.push(task);
    } else {
        task.result = 'failure';
        log(task, handler.log(task));
        var report = handlers[task.action].report(task);
        reportQueue.push(report);
    }
    getTask();
};


var taskFinish = function(task) {
    var handler = handlers[task.action];
    handler.finish(task, function(err, task){
        log(task, handler.log(task));
        getTask();
        var report = handler.report(task);
        reportQueue.push(report);
    });
};

var aq = async.queue(function(task, callback) {
    var to = setTimeout(function() {
        taskQueue.push(task);
    }, 60000);
    dispatcher.dispatch(task, function(err, task) {
        clearTimeout(to);
        if(err){
            taskError(err, task);
        }else{
            taskFinish(task);
        }
        callback();
    });
}, 5);

var getTask = function(){
	if(aq.length() >= 5){
		return;
	}
	taskQueue.pop(function(err, task){
		if(err || !task){
			return;
		}

		if(typeof task.retry == 'undefined'){
			task.retry = 0;
		}
		aq.push(task);
	});
}
taskQueue.on('hasTask', function(){
	getTask();
});

var log = function(task, info){
	var msg = [task.result, task.action, task.fromApp, task.taskId, task.accountId].join("\t");
	if(info){
		msg += "\t" + info;
	}
	if(task.err){
		msg += "\t" + task.err.msg;
	}
	runLogger.info(msg);
}

console.log("weibo task controller start at " + tool.getDateString());
