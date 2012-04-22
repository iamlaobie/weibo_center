var redis = require("redis");
var util = require('util');
var EE = require('events').EventEmitter;

var Queue = function(settings){
	var queue = settings.queue.name;
	var _self = this;
	var rc = redis.createClient(settings.redis.port, settings.redis.host);
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

	var timer = setInterval(function(){
		_self.length(function(err, len){
			if(len > 0){
				_self.emit("hasTask", len);		
			}
		});
	}, settings.queue.pollInterval);

}
util.inherits(Queue, EE);
exports.Queue = Queue;