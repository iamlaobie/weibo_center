var settings = require("./etc/settings.json");
var Queue = require('./lib/queue');
var async = require('aysnc');

var taskQueue = new Queue(settings);

var getTask = function(){
	
}