var _ = require("underscore");
var db = require('../lib/db');
var tool = require('../lib/tool');
module.exports = {
    apiAction:"destroy",
    receive:function(data){
        if(!data.weiboDbId || !data.weiboDbId.match(/^\d+$/)){
            return {message:"weiboDbId's format is not valid", result:"error"};
        }
        var task = _.clone(data);
        task.weiboDbId = ids[i];
        task.action = '';
        tasks.push(task);
        return {result:"ok",task:task};
    },

    prepare:function(context, callback){
        db.getWeibo(context.task.weiboDbId, function(err, result){
            if(!result || result.length  == 0){
                var err = {message:"the weiboDbId is not exist"};
                callback(err, context);
            }else{
                context.task.weiboId = context.task.id = result[0].weibo_id;
                context.task.accountId = result[0].account_id;
                callback(null, context);
            }
        });
    },

    finish:function(context, callback){
        var task = context.task;
        db.deleteWeibo(task.weiboDbId, function(err, result){
            callback(err, context);
        });
    }, 

    report:function(context){
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
        }
        return report;
    },

    log:function(context){
        var task = context.task;
        return task.weiboId;
    },

    error:function(err, context){
        if(err.message.match(/timeout/i)){
            return "retry";
        }

        if(err.message.match(/^40(308|090|310)/)){
            return "limit";
        }

        if(err.message.match(/mysql/) || err.message.match(/^20101/)){
            return "drop";
        }

        return "retry";
    }
};