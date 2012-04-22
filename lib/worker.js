var util = require("util");
var mysql = require("mysql");
var weibo = require("weibo");
var EE = require("events").EventEmitter;
var async = require("async");

var Worker = function(settings){
	var _self = this;

	for(var api in settings.apis){
		weibo.tapi.init(api, settings.apis[api].appkey, settings.apis[api].secret);
	}


	this.runAble = function(task, context, callback){

	};


	this.getAccount = function(task, context, callback){

	};

	this.exec = function(task, context, callback){
		
	}


}
util.inherits(Worker, EE);