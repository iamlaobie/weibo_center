var redis = require("redis");
var util = require('util');
var EE = require('events').EventEmitter;

var Queue = function(name, rc, pollInterval){
	var queue = name;
	var _self = this;

	rc.select(settings.redis.db);

	_self.push = function(task){
		rc.lpush(queue, task);
	};

	_self.pop = function(callback){
		rc.rpop(queue, callback);
	};

	_self.length = function(callback){
		rc.llen(queue, callback);
	};

	var interval = pollInterval ? pollInterval : 5000;
	var timer = setInterval(function(){
		_self.length(function(err, len){
			if(len > 0){
				_self.emit("hasTask", len);		
			}
		});
	}, interval);

}
util.inherits(Queue, EE);
exports.Queue = Queue;