var settings = require("../etc/settings.json");
var Queue = require("../lib/queue").Queue;

var q = new Queue('weiboSendTask', settings);
//q.push({});

q.pop(function(err, task){
	console.log([err, task]);
});

q.on("hasTask", function(){
	console.log('has task');
});