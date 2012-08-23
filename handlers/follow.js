var _ = require("underscore");
var db = require('../lib/db');
var tool = require('../lib/tool');
module.exports = {
    apiAction:"friendships_create",

    receive:function(data){
        if(!data.accountId || !data.accountId.match(/^\d+$/)){
            return {message:"accountId's format is not valid", result:"error"};
        }

        if(!data.weiboUserId || typeof data.weiboUserId != 'string'){
            return {message:"weiboUserId's format is not valid", result:"error"};
        }

        var task = _.clone(data);
        return {result:"ok",task:task};
    },

    prepare:function(context, callback){
        context.task.user_id = context.task.weiboUserId;
        callback(null,  context);
    },

    finish:function(context, callback){
        callback(null, context);
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
        report.weiboUserId = task.weiboUserId;

        report.msg = '';
        if(context.err){
            report.msg = context.err.message;
        }
        return report;
    },

    log:function(context){
        var task = context.task;
        var report = this.report(context);
        var weiboUserId = task.weiboUserId;
        return weiboUserId;
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
}