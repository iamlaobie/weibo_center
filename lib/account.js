var EE = require("events").EventEmitter;
var tool = require("../lib/tool");
var util = require("util");
var Account = function(mcli){
	var _self = this;
	_self.accounts = {};
	
	_self.create = function(account, callback){
		var sql = "INSERT INTO weibo_account(username, password," 
				+ "provider, oauth_version, in_time)"
				+ " VALUES(?, ?, ?, ?, ?)";
		var data = [account.username, account.password, account.provider, account.oauth_version, tool.getDateString()];
		mcli.query(sql, data, function(err, info){
			if(callback){
				callback(err, info);
			}
			account.id = info.insertId;
			_self.accounts[account.id] = account;
		});		
	}

	_self.update = function(account, cb){
        var sql = "UPDATE account SET weibo_user_id= ?, access_token = ?,access_token_secret = ?, expire_in = ? WHERE id = ?";
        if(!account.expire_in){
        	account.expire_in = 0;
        }
        var data = [account.weibo_user_id, account.access_token, account.access_token_secret, account.expire_in, account.id];
        cli.query(sql, data, function(error, info){
        	if(!error){
        		_self.accounts[account.id] = account;
        	}
            cb(error, info);
        });
    };

	_self.get = function(id){
		return _self.accounts[id];
	};

	_self.getAll = function(){
		return _self.accounts;
	};

	_self.load = function(callback){
		var sql = "SELECT * FROM weibo_account";
		mcli.query(sql, function(err, accounts){
			console.log(accounts);
			for(var i = 0; i < accounts.length; i++){
				_self.accounts[accounts[i].id] = accounts[i];
			}
			if(callback){
				callback(err, _self.accounts);
			}
		});
	};

	//init the accounts list
	_self.load(function(){
		_self.emit("ready");
	});
}
util.inherits(Account, EE);

module.exports.init = function(mcli){
	return new Account(mcli);
}




