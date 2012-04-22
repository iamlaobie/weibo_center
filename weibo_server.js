var settings = require('./etc/settings.json');
var express = require('express');
var Queue = require('./lib/queue').Queue;
var tool = require('./lib/tool');
var logger = require('./lib/logger').logger(settings.log);

var validator = require('./lib/validator');

var taskQueue = new Queue(settings);

var app = express.createServer();
app.use(express.bodyParser());

app.post('/weibo/:action', function(req, res){
	var action = req.params.action;
	var data = req.body;
	var result = {};
	var vr = validator.validate(action, data);
	if(vr != 'valid'){
		result = JSON.stringify({result:"ERROR", msg:vr});
		res.write(result);
		res.end();
		return;	
	}
	
	var taskId = tool.uniqString();
	var result = JSON.stringify({result:"RECEIVED", taskId:taskId});
	res.write(result);
	res.end();

	data.taskId = taskId;
	data.receiveTime = tool.getDateString();
	data.action = action;
	var ids = data.accountIds.match(/\d+/g);
	delete data.accountIds;
	ids.forEach(function(id){
		data.accountId = id;
		taskQueue.push(data);	
	});
		
	var log = action + "\t" + data.appId + "\t" + data.accountIds + "\t" + data.text + "\t" + taskId;
	logger.info(log);
});
app.listen(8080);