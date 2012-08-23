var util = require('util');
var EE = require('events').EventEmitter;

var Queue = function(name, rc, pollInterval){
	var queue = name;
	var _self = this;

	_self.push = function(task){
		if(typeof task != 'string'){
			task = JSON.stringify(task);
		}
		rc.lpush(queue, task);
	};

	_self.pop = function(callback){
		rc.rpop(queue, function(err, data){
			if(err){
				callback(err);
			}else{
				try{
					var d = JSON.parse(data);
				}catch(e){
					var d = data;
				}
				callback(null, d);
			}
		});
	};

	_self.length = function(callback){
		rc.llen(queue, callback);
	};

	var interval = pollInterval || 2000;
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