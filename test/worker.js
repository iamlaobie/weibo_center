var settings = require("../etc/settings.json");
var Worker = require("../lib/worker");
var worker = new Worker(settings);
worker.on('error', function(error, context){
	console.log([error, context]);
});

worker.on("finish", function(context){
	console.log(context);
});

worker.on('ready', function(){
	worker.work(task, function(err){
		console.log('aaaa');
	});	
});

