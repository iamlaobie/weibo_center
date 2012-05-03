/**
    
*/
var settings = require("./etc/settings.json");
var Queue = require('./lib/queue').Queue;
var hihttp = require("./lib/hihttp");
var  tool = require("./lib/tool");
var async = require('async');
var redis = require("redis");
var redisClient = redis.createClient(settings.redis.port, settings.redis.host);
redisClient.select(settings.redis.db);
var runLogger = require('./lib/logger').logger("report.log");
var appSettings = require('./etc/apps.json');

var reportQueue = new Queue(settings.reportQueue.name, redisClient);

var aq = async.queue(function(report, queueCallback){
    var app = appSettings[report.fromApp];
    if(!app || !app.reportUrl){
        queueCallback();
        return;
    }
    hihttp.post(app.reportUrl, report, function(err, result){
        console.log([err, result]);
        var  statusCode = "200";
        if(err){
            if(report.retry < 5){
                setTimeout(function(){
                    reportQueue.push(report);    
                }, 30000);
                queueCallback();
                return;
            }else{
                statusCode = err.statusCode;    
            }
        }
        var log = [report.result, report.action, report.taskId, report.fromApp, report.msg, statusCode].join("\t");
        runLogger.info(log);
        queueCallback();
        getTask();
    });
}, 5);

var getTask = function(){
    if(aq.length() >= 5){
        return;
    }
    reportQueue.pop(function(err, task){
        if(err || !task){
            return;
        }

        if(typeof task.retry == 'undefined'){
            task.retry = 0;
        }
        aq.push(task);
    });
}

reportQueue.on('hasTask', function(){
    getTask();
});

console.log("weibo report sender start at " + tool.getDateString());