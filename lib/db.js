var settings = require("../etc/settings");
var mysql = require("mysql");
var tool = require("../lib/tool");
var mcli = mysql.createClient(settings.mysql);

var formatError = function(err){
	return err;
}


var db = {

	insertWeibo :function(weibo, callback){
		var sentTime = tool.getDateString();
		var sql = "INSERT INTO weibo_sent(content, img, sent_time, weibo_id, weibo_url, account_id, task_id, provider, from_app) "
	                    + "values(?, ?, ?, ?, ?, ?, ?, ?, ?)";
	    var data = [weibo.status, weibo.img, sentTime, weibo.id, 
	    			weibo.weiboUrl, weibo.accountId, weibo.taskId, 
	    			weibo.provider, weibo.fromApp];

	    mcli.query(sql, data, callback);
	},

	insertWeiboRepost: function(weiboId, repostId, accountId, status, callback){
		var inTime = tool.getDateString();
		var sql = "INSERT INTO weibo_repost(`weibo_id`,`repost_id`,`account_id`,`content`,`in_time`)" 
					+ " VALUES(?,?,?,?,?)";

		var data = [weiboId, repostId, accountId, status, inTime];
		mcli.query(sql, data, callback);
	},

	getWeibo:function(id, callback){
		var sql = "SELECT * FROM weibo_sent WHERE id = ?";
		mcli.query(sql, [id], callback);
	},

	deleteWeibo:function(id, callback){
		var deleteTime = tool.getDateString();
		var sql = "UPDATE weibo_sent SET deleted = ?, delete_time = ? WHERE id = ?";
		mcli.query(sql, [1, deleteTime, id], callback);
	},

	getRepost:function(id, callback){
		var sql = "SELECT * FROM weibo_repost WHERE id = ?";
		mcli.query(sql, [id], callback);
	},

	deleteRepost:function(id, callback){
		var deleteTime = tool.getDateString();
		var sql = "UPDATE weibo_repost SET deleted = ?, delete_time = ? WHERE id = ?";
		mcli.query(sql, [1, deleteTime, id], callback);
	}


} //EOF Db

module.exports = db;


