var _ = require("underscore");
var db = require('../lib/db');
var tool = require('../lib/tool');
module.exports = {
    apiAction:"comment",

    receive:function(data){

        if(!data.accountId || !data.accountId.match(/^\d+$/)){
            return {message:"accountId's format is not valid", result:"error"};
        }

        if(!data.weiboDbId || typeof data.weiboDbId != 'string'){
            return {message:"weiboDbId's format is not valid", result:"error"};
        }

        if(!data.comment){
            return {message:"comment is empty", result:"error"};
        }
        var task = _.clone(data);
        return {result:"ok",task:task};
    },

    prepare:function(context, callback){
        db.getWeibo(context.task.weiboDbId, function(err, result){
            if(!result || result.length  == 0){
                var err = {message:"the weiboDbId is not exist"};
                callback(err, context);
            }else{
                context.task.weiboId = context.task.id = result[0].weibo_id;
                callback(null, context);
            }
        });
    },

    finish:function(context, callback){
        var resp = context.response;
        var task = context.task;
        task.comment = context.rawTask.comment;

        var account = context.account; 
        var status = task.status || '';
        db.insertComment(task.weiboDbId, resp.id, account.id, task.comment, function(err, result){
            if(!err){
                context.commnetDbId = result.insertId;
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
            report.commentDbId = context.commentDbId;
            report.commentId = resp.id.toString();
        }
        return report;
    },

    log:function(context){
        var task = context.task;
        var report = this.report(context);
        var weiboId = task.weiboId || '-';
        var commentId = report.commentId || '-';
        var log = [task.comment, commentId, weiboId];
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

        return "retry";
    }
};