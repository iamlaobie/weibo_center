var settings = require("../etc/settings.json");
var Worker = require("../lib/worker");
var worker = new Worker(settings);
worker.on('error', function(error, context){
	console.log([error, context]);
});

worker.on("finish", function(context){
	console.log(context);
});

var task = {taskId:'12434235435436546546',accountId:'10000', fromApp:'stockRadar', action:"update", status:"this is a test too too too too too too too"};
worker.on('ready', function(){
	worker.work(task, function(err){
		console.log('aaaa');
	});	
});

