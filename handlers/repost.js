var _ = require("underscore");
var db = require('../lib/db');
var tool = require('../lib/tool');
module.exports = {
	apiAction:"repost",

	receive:function(data){
		if(!data.accountIds){
			return {message:"no accountIds", result:"error"};
		}

		if(!data.accountIds.match(/^\d+(\,\d+)*$/)){
			return {message:"accountIds's format is not valid", result:"error"};
		}

		if(!data.weiboDbId && !data.weiboId){
			return {message:"weiboId's format is not valid", result:"error"};
		}

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
		if(context.task.weiboId){
			context.task.id = context.task.weiboId;
			db.getWeiboByWeiboId(context.task.weiboId, function(err, result){
				if(!result || result.length  == 0){
					var err = {message:"the weiboId is not exist"};
					callback(err, context);
				}else{
					context.task.weiboDbId = result[0].id;
					callback(null, context);
				}
			});
		}else{
			db.getWeibo(context.task.weiboDbId, function(err, result){
				if(!result || result.length  == 0){
					var err = {message:"70000:the weiboDbId is not exist"};
					callback(err, context);
				}else{
					context.task.weiboId = context.task.id = result[0].weibo_id;
					callback(null, context);
				}
			});
		}
		
	},

	finish:function(context, callback){
		var resp = context.response;
		var task = context.task;

		var account = context.account; 
		var status = task.status || '';
		db.insertWeiboRepost(task.weiboDbId, resp.id, account.id, status, function(err, result){
			if(!err){
				context.repostDbId = result.insertId;
			}
			callback(err, context);
		});
	}, 

	report:function(context){
		var resp = context.response;
		var task = context.task;

		var report = {
			taskId:task.taskId,
	        action:task.action,
	        accountId:task.accountId,
	        result:context.result,
	        fromApp:task.fromApp
		};

		report.msg = '';
		if(context.err){
			report.msg = context.err.message;
		}else{
			report.repostDbId = context.repostDbId;
			report.weiboUrl = resp.t_url;
			report.repostId = resp.id.toString();
		}
		return report;
	},

	log:function(context){
		var task = context.task;
		var report = this.report(context);
		var weiboId = task.weiboId || '-';
		var repostId = task.repostId || '-';
		var weiboUrl = report.weiboUrl || '-';
		var log = [task.status, repostId, weiboId, weiboUrl];
		return log.join("\t");
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

		if(err.message.match(/^70000/)){
			return "delay";
		}

		return "retry";
	}
};