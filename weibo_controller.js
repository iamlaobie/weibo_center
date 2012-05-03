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
		runLog(err, context);
		var report = handlers[context.task.action].report(context);
		console.log(report);
		reportQueue.push(report);
	}
	getTask();
});


worker.on("finish", function(context){
	runLog(null, context);
	getTask();
	var report = handlers[context.task.action].report(context);
	reportQueue.push(report);
});
var aq = async.queue(worker.work, 5);

var getTask = function(){
	if(aq.length() >= 5){
		return;
	}
	taskQueue.pop(function(err, task){
		if(err){
			runLog(err);
			return;
		}

		if(!task){
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


var runLog = function(err, context){
	var result = err ? 'ERROR' : 'SUCCESS';
	context = context || {};
	var resp = context.response || {};
	var task = context.task || {};
	var account = context.account || {};;  
	task = task || {};
	var taskId = task.taskId || '-';
	var action = task.action || '-';
	var img = task.img || '-';
	var accountId = task.accountId || '-';
	var weiboId = task.weiboId || '-';
	var status = task.status || '-';
	var newId = resp.id || '-';
	var url = resp.t_url || '-';
	var msg = err ? err.message : '-';
	var fromApp = task.fromApp || '-'

	status = decodeURI(status);
	
	var log = [result, action, fromApp, taskId, accountId, weiboId, 
				newId, url, status, img, msg].join("\t");
	runLogger.info(log);
}
console.log("weibo task controller start at " + tool.getDateString());
