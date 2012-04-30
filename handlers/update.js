var db = require('../lib/db');
var tool = require('../lib/tool');
module.exports = {
	prepare:function(context, callback){
		callback(null, context);
	},

	finish:function(context, callback){
		var resp = context.response;
		var task = context.task;
		var account = context.account; 
		task.img = task.img || '';
		task.taskId = task.taskId || '';
		task.status = task.status || '';
		var weibo = {
			status:task.status,
			img:task.img,
			id:resp.id.toString(),
			weiboUrl:resp.t_url,
			accountId:account.id,
			taskId:task.taskId,
			provider:account.provider,
			fromApp:task.fromApp
		};
		db.insertWeibo(weibo, callback);
	}
};