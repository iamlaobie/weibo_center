var db = require('../lib/db');
var tool = require('../lib/tool');
module.exports = {
	prepare:function(context, callback){
		db.getWeibo(context.task.weiboId, function(err, result){
			if(!result || result.length  == 0){
				var err = {message:"the weiboId is not exist"};
				callback(err, context);
			}else{
				callback(null, context);
			}
		});
	},

	finish:function(context, callback){
		var resp = context.response;
		var task = context.task;

		var account = context.account; 
		var status = task.status || '';
		db.insertWeiboRepost(task.weiboId, resp.id, account.id, status, callback);
	}
};