var EE = require("events").EventEmitter;
var tool = require("../lib/tool");
var util = require("util");
var mysql = require("mysql");
var Account = function(options) {
    var settings = options.settings;
    var _self = this;
    var mcli = options.mysqlCli;
    var redisCli = options.redisCli;

    var getKey = function(id) {
        return "ACCOUNT_" + id;
    }

    var setToRedis = function(account) {
        var key = getKey(account.id);
        redisCli.set(key, JSON.stringify(account));
    }

    _self.create = function(account, callback) {
        account.refresh_token = account.refresh_token || '';
        account.qq_open_key = account.qq_open_key || '';
        account.oauth_version = account.oauth_version || 2;
        var sql = "INSERT INTO weibo_account(username, password,"
				+ "weibo_user_id, access_token, expire_in, provider, oauth_version, in_time, refresh_token, qq_open_key)"
				+ " VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE access_token = ?, expire_in = ?, refresh_token = ?";
        var data = [account.username, account.password, account.weibo_user_id,
                    account.access_token, account.expire_in, account.provider,
                    account.oauth_version, tool.getDateString(), account.refresh_token, 
                    account.qq_open_key, account.access_token, account.expire_in, account.refresh_token];
        mcli.query(sql, data, function(err, info) {
            if(!callback) {
                callback = function() { };
            }
            if(!err) {
                account.id = info.insertId;
                setToRedis(account);
                callback(null, account);
            } else {
                callback(err);
            }
        });
    }

    _self.update = function(account, callback) {
        var sql = "UPDATE weibo_account SET weibo_user_id= ?, access_token = ?,access_token_secret = ?, expire_in = ? WHERE id = ?";
        if(!account.expire_in) {
            account.expire_in = 0;
        }
        var data = [account.weibo_user_id, account.access_token, account.access_token_secret, account.expire_in, account.id];
        mcli.query(sql, data, function(err, result) {
            if(!err) {
                setToRedis(account);
            }
        });
    };

    _self.get = function(id, callback) {
        var key = getKey(id);
        redisCli.get(key, function(err, result) {
            if(err || !result) {
                callback({ msg: "not found the account" });
            } else {
                var account = JSON.parse(result);
                callback(null, account);
            }
        });
    };

    _self.getValid = function(id, callback) {
        _self.get(id, function(err, account) {
            if(err) {
                callback(err);
            } else if(account.expire_in > tool.timestamp()) {
                callback(null, account)
            } else {
                callback({ msg: "expired" });
            }
        });
    }

    _self.load = function(callback) {
        var sql = "SELECT * FROM weibo_account";
        mcli.query(sql, function(err, accounts) {
            for(var i = 0; i < accounts.length; i++) {
                setToRedis(accounts[i]);
            }
            if(callback) {
                callback(err, accounts);
            }
        });
    };

    //init the accounts list
    _self.load(function() {
        _self.emit("ready");
    });
}
util.inherits(Account, EE);
module.exports = Account;




