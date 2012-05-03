var _ = require("underscore");
var db = require('../lib/db');
var tool = require('../lib/tool');
module.exports = {
	apiAction:"update",
	receive:function(data){
		if(!data.accountIds){
			return {message:"no accountIds", result:"error"};
		}

		if(!data.accountIds.match(/^\d+(\,\d+)*$/)){
			return {message:"accountIds's format is not valid", result:"error"};
		}

		if(!data.status && !data.img){
			return {message:"no text or img", result:"error"};
		}

		data.status = data.status || '';
		data.img = data.img || '';
		var ids = data.accountIds.match(/\d+/g);
		var tasks = [];
		for(var i = 0; i < ids.length; i++){
			var task = _.clone(data);
			task.accountId = ids[i];
			tasks.push(task);
		}
		return {result:"ok",tasks:tasks};
	},

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
			status:decodeURI(task.status),
			img:task.img,
			id:resp.id.toString(),
			weiboUrl:resp.t_url,
			accountId:account.id,
			taskId:task.taskId,
			provider:account.provider,
			fromApp:task.fromApp
		};
		db.insertWeibo(weibo, function(err, result){
			if(!err){
				context.weiboDbId = result.insertId;
			}
			callback(err, context);
		});
	},

	report:function(context){
		var task = context.task;
	    var body = {
	        taskId:task.taskId,
	        action:task.action,
	        accountId:task.accountId,
	        result:context.result,
	        fromApp:task.fromApp,
	        retry:0
	    };

	    body.msg = '';
	    if(context.err){
	        body.msg = context.err.message;
	    }else{
	    	var resp = context.response;
	    	body.weiboId = resp.id.toString();
	    	body.weiboUrl = resp.t_url;
	    	body.weiboDbId = context.weiboDbId;
	    }
	    return body;
	},

	error:function(err, context){
		if(err.message.match(/timeout/i)){
			return "retry";
		}

		if(err.message.match(/^40(308|090|310)/)){
			return "limit";
		}

		if(err.message.match(/^400(13|25)/)){
			return "drop";
		}
		return "retry";
	}

};