var _ = require("underscore");
var db = require('../lib/db');
var tool = require('../lib/tool');
module.exports = {
    apiAction:"destroy",
    receive:function(data){
        if(!data.repostDbIds || !data.repostDbIds.match(/^\d+(\,\d+)*$/)){
            return {message:"repostDbIds's format is not valid", result:"error"};
        }

        var ids = data.repostDbIds.match(/\d+/g);
        var tasks = [];
        for(var i = 0; i < ids.length; i++){
            var task = _.clone(data);
            task.repostDbId = ids[i];
            tasks.push(task);
        }
        return {result:"ok",tasks:tasks};
    },

    prepare:function(context, callback){
        db.getRepost(context.task.repostDbId, function(err, result){
            if(!result || result.length  == 0){
                var err = {message:"the repostDbId is not exist"};
                callback(err, context);
            }else{
                context.task.repostDbId = context.task.id = result[0].repost_id;
                context.task.accountId = result[0].account_id;
                callback(null, context);
            }
        });
    },

    finish:function(context, callback){
        var task = context.task;
        db.deleteRepost(task.repostDbId, function(err, result){
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