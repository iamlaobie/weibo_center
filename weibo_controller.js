var settings = require("./etc/settings.json");
var Queue = require('./lib/queue');
var async = require('aysnc');
var redis = require("redis");
redis.createClient(settings.redis.port, settings.redis.host);
var redisClient = redis.select(settings.redis.db);
var runLogger = require('./lib/logger').logger("run.log");
var finishLogger = require('./lib/logger').logger("finish.log");

//task queue
var taskQueue = new Queue(settings.taskQueue.name, redisClient);

var Worker = require("../lib/worker");
var worker = new Worker(settings);
worker.on('error', function(error, context){
	if(task.retry >= settings.retry){
		runLog(err, context);
	}else{
		task.retry += 1;
		taskQueue.push(task);
	}
});


worker.on("finish", function(context){
	finish(context);
	getTask();
});
var aq = async.queue(worker.work, 5);
var getTask = function(){
	if(aq.length >= 5){
		return;
	}
	taskQueue.pop(function(err, task){
		if(err){
			runLog(err);
			return;
		}
		if(typeof task.retry == 'undefined'){
			task.retry = 0;
		}
		aq.push(task);
	});
}
worker.on('task', function(){
	getTask();
});

var runLog = function(err, task){
	task = task || {};
	task.taskId = task.taskId || '-';
	task.action = task.action || '-';
	task.accountId = task.accountId || '-';
	task.weiboId = task.weiboId || '-';
	task.status = task.status || '-';
	var log = [task.action, task.taskId, task.accountId, task.weiboId, task.status, err.message].join("\t");
	runLog.info(log);
}

var finish = function(context){
	var resp = context.response;
	var weiboId = resp.id;
}
