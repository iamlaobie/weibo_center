var settings = require("./etc/settings.json");
var tool = require("./lib/tool");
var Queue = require('./lib/queue').Queue;
var handlers = require('./handlers');
var async = require('async');
var redis = require("redis");
var redisClient = redis.createClient(settings.redis.port, settings.redis.host);
redisClient.select(settings.redis.db);
var runLogger = require('./lib/logger').logger("run.log");

//task queue
var taskQueue = new Queue(settings.taskQueue.name, redisClient);
var reportQueue = new Queue(settings.reportQueue.name, redisClient);

var Worker = require("./lib/worker");
var worker = new Worker(settings);
worker.on('error', function(err, context){
	var task = context.task;
	var handler = handlers[task.action];
	var deal = handler.error(err, context);
	if(deal == 'delay'  && task.retry < settings.retry){
		setTimeout(function(){
			task.retry += 1;
			taskQueue.push(task);
		}, 60000);
	}else if(deal == 'retry' && task.retry < settings.retry){
		task.retry += 1;
		taskQueue.push(task);
	}else{
		log(context, handler.log(context));
		var report = handlers[context.task.action].report(context);
		reportQueue.push(report);
	}
	getTask();
});


worker.on("finish", function(context){
	var handler = handlers[context.task.action];
	log(context, handler.log(context));
	getTask();
	var report = handler.report(context);
	reportQueue.push(report);
});

var aq = async.queue(worker.work, 5);

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

var log = function(contxt, info){
	var task = context.task;
	var msg = [context.result, task.action, task.fromApp, task.taskId, task.accountId].join("\t");
	if(info){
		msg += "\t" + info;
	}
	if(context.err){
		msg += "\t" + context.err.message;
	}
	runLogger.info(msg);
}

console.log("weibo task controller start at " + tool.getDateString());
