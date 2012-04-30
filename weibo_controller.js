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
var reportQueue = new Queue(settings.reportQueue.name, redisClient);

var Worker = require("../lib/worker");
var worker = new Worker(settings);
worker.on('error', function(error, context){
	if(error.retry && task.retry < settings.retry){
		task.retry += 1;
		taskQueue.push(task);
	}else{
		runLog(err, context);
	}
});


worker.on("finish", function(context){
	runLog(null, context);
	getTask();
	reportQueue.push(context);
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
taskQueue.on('hasTask', function(){
	getTask();
});


var runLog = function(err, context){
	var result = err ? 'ERROR' : 'SUCCESS';
	context = context || {};
	var resp = context.response;
	var task = context.task;
	var account = context.account; 
	task = task || {};
	var taskId = task.taskId || '-';
	var action = task.action || '-';
	var img = task.img || '-';
	var accountId = account.id || '-';
	var weiboId = task.weiboId || '-';
	var status = task.status || '-';
	var newId = resp.id || '-';
	var msg = err ? err.message : '-';
	
	var log = [result, action, taskId, accountId, weiboId, 
				newId, status, img, msg].join("\t");
	runLog.info(log);
}
