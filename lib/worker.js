var util = require("util");
var mysql = require("mysql");
var weibo = require("weibo");
var EE = require("events").EventEmitter;
var async = require("async");
var Account = require("../lib/account");
var handlers = require('../handlers');

var Worker = function(settings){
	var _self = this;

	var mcli = mysql.createClient(settings.mysql);
	var acntMgr = new Account(mcli);

	for(var api in settings.apis){
		weibo.tapi.init(api, settings.apis[api].appkey, settings.apis[api].secret);
	}

	acntMgr.on('ready', function(){
		_self.emit('ready');
	});

	this.prepare = function(context, callback){
		var task = context.task;
		if(!task.action || typeof weibo.tapi[task.action] != 'function'){
			var err = {message:"unknow action"};
			callback(err, context);
			return;
		}

		if(!handlers[task.action]){
			var err = {message:'can not handle this action'};
			callback(err, context);
			return;
		}
		context.handler = handlers[task.action];
		handlers[task.action].prepare(context, callback);
	}

	this.getAccount = function(context, callback){
		var task = context.task;
		var account = acntMgr.getToken(task.accountId);
		if(!account){
			var err = {message:"not found account " + task.accountId};
			callback(err, context);
		}else{
			context.account = account
			callback(null, context);
		}
	};

	this.exec = function(context, callback){
		var task = context.task;
		task.user = context.account;
		weibo.tapi[task.action](task, function(err, body){
			context.response = body;
			var error = err ? err.message : null;
			callback(error, context);
		});
	}

	this.finish = function(context, callback){
		context.handler.finish(context, function(err, context){
			if(err){
				console.log(err);
			}
			callback(err, context);
		});
	}

	this.work = function(task, queueCallback){
		context = {};	
		context.task = task;
		var start = function(callback){
			callback(null, context);
		}
		var funcs = [start, _self.prepare, _self.getAccount, _self.exec, _self.finish];
		async.waterfall(funcs, function(err, context){
			if(err){
				_self.emit('error', err, context);
			}else{
				_self.emit('finish', context);
			}
			queueCallback();
		});
	}
}
util.inherits(Worker, EE);
module.exports = Worker;