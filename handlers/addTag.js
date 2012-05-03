var _ = require("underscore");
var db = require('../lib/db');
var tool = require('../lib/tool');
module.exports = {
    apiAction:'create_tag',

    receive:function(data){
        if(!data.accountId || !data.accountId.match(/^\d+$/)){
            return {message:"accountId's format is not valid", result:"error"};
        }

        if(!data.tags || data.tags == ''){
            return {message:"tags is empty", result:"error"};
        }

        var tasks  = [{tags:data.tags,accountId:data.accountId, fromApp:data.fromApp}];
        return {result:"ok",tasks:tasks};
    },

    prepare:function(context, callback){
        callback(null, context);
    },

    finish:function(context, callback){
        callback(null, context);
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

        if(err.message.match(/^40077/)){
            return 'drop';
        }

        if(err.message.match(/^40(308|090|310)/)){
            return "limit";
        }

        return "retry";
    }
};