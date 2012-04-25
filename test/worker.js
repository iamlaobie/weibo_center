var settings = require("../etc/settings.json");
var Worker = require("../lib/worker");
var worker = new Worker(settings);
worker.on('error', function(error, context){
	console.log([error, context]);
});

worker.on("finish", function(context){
	console.log(context);
});

var task = {accountId:'10000', action:"update", status:"this is a test"};
worker.on('ready', function(){
	worker.work(task, {});	
});

