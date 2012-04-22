var EE = require("events").EventEmitter;
var util = require("util");
var Account = function(redis){
	var _self = this;
	_self.accounts = {};
	var hash = "weibo_account";

	
	_self.create = function(account){
		redis.hset(hash, account.accountId, JSON.stringify(account));
		_self.accounts[account.accountId] = account;
	}

	_self.update = function(account){
		_self.create(account);
	}

	_self.get = function(accountId){
		return _self.accounts[accountId];
	};

	_self.getAll = function(){
		return _self.accounts;
	};

	_self.load = function(callback){
		redis.hgetall(hash, function(err, accounts){
			for(var key in accounts){
				_self.accounts[key] = JSON.parse(accounts[key]);
			}
			if(callback){
				callback(err, _self.accounts);
			}
		});
	};

	//init the accounts list
	_self.load();
}
util.inherits(Account, EE);

module.exports.init = function(redis){
	return new Account(redis);
}
/*
var redis = require("redis");
var cli = redis.createClient(6379);
var a = new Account(cli);
setTimeout(function(){
	console.log(a.getAll());	
}, 1000);
*/




