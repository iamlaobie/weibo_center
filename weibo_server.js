var settings = require('./etc/settings.json');
var express = require('express');
var Queue = require('./lib/queue').Queue;
var tool = require('./lib/tool');
var logger = require('./lib/logger').logger(settings.log);
var redis = require("redis");
var handlers = require("./handlers");


var redisClient = redis.createClient(settings.redis.port, settings.redis.host);
redisClient.select(settings.redis.db);
var taskQueue = new Queue(settings.taskQueue.name, redisClient);

var app = express.createServer();
app.use(express.bodyParser());

var response = function(res, body){
	if(typeof body == 'object'){
		body = JSON.stringify(body);
	}
	res.send(body);
}

app.post('/weibo/:action', function(req, res){
	var action = req.params.action;
	if(!handlers[action]){
		var err = tool.werror("can not handle this action", "error");
		response(res, err);
		return;
	}
	
	var handler = handlers[action];
	var data = req.body;
	var valid = handler.receive(data);
	if(valid.result != 'ok'){
		response(res, valid);
		return;	
	}
	
	var taskId = tool.uniqString();
	var result = JSON.stringify({result:"receive", taskId:taskId});
	response(res, result);

	data.taskId = taskId;
	data.receiveTime = tool.getDateString();
	data.action = action;
	var ids = data.accountIds.match(/\d+/g);
	ids.forEach(function(id){
		data.accountId = id;
		taskQueue.push(data);	
	});
	var log = action + "\t" + data.fromApp + "\t" + data.accountIds + "\t" + data.status + "\t" + taskId;
	logger.info(log);
});
app.listen(8080);
console.log("weibo server start at " + tool.getDateString());