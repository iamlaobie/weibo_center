var settings = require('./etc/settings.json');
var express = require('express');
var _ = require("underscore");
var Queue = require('./lib/queue').Queue;
var tool = require('./lib/tool');
var logger = require('./lib/logger').logger(settings.log);
var redis = require("redis");
var handlers = require("./handlers");
var adapterMgr = require("./adapters").init(settings);
var adapters = adapterMgr.getAdapters();
var Account = require("./lib/account.js");

var mysql = require("mysql");
var mysqlCli = mysql.createClient(settings.mysql);

var redisClient = redis.createClient(settings.redis.port, settings.redis.host);
redisClient.select(settings.redis.db);
var taskQueue = new Queue(settings.taskQueue.name, redisClient);

var accountMgr = new Account({mysqlCli:mysqlCli, redisCli:redisClient,settings:settings});


var app = express.createServer();
app.use(express.bodyParser());

var response = function(res, body){
	if(typeof body == 'object'){
		body = JSON.stringify(body);
	}
	res.send(body);
}

app.post('/weibo/:action', function(req, res) {
    var action = req.params.action;
    if(!handlers[action]) {
        var err = tool.werror("can not handle this action", "error");
        response(res, err);
        return;
    }

    var handler = handlers[action];
    var data = req.body;
    var valid = handler.receive(data, req);
    if(valid.result != 'ok') {
        response(res, valid);
        return;
    }
    var taskData = valid.task;
    accountMgr.getValid(taskData.accountId, function(err, account) {
        if(err) {
            var errMsg = tool.werror("the account is invalid or expired", "error");
            response(res, errMsg);
            return;
        }
        var taskId = tool.uniqString();
        var result = JSON.stringify({ result: "receive", taskId: taskId });
        response(res, result);

        var receiveTime = tool.getDateString();
        var task = {};
        task.receiveTime = receiveTime;
        task.action = action;
        task.taskId = taskId;
        task.account = account;
        task.data = taskData;
        task.fromApp = req.body.fromApp;
        taskQueue.push(task);

        var keys = _.keys(data);
        keys = _.sortBy(keys, function(key) {
            return key;
        });

        var log = action + "\t" + taskId;
        for(var i = 0; i < keys.length; i++) {
            log += "\t" + keys[i] + ":" + data[keys[i]];
        }
        logger.info(log);
    });
});

app.get("/auth", function(req, res) {
    var provider = req.query.provider;
    var redirectUrl = req.query.redirectUrl;
    console.log(req.query);
    var cacheKey = 'auth_' + tool.uniqString();
    redisClient.set(cacheKey, redirectUrl);
    if(!adapters[provider]) {
        var err = tool.werror("can not handle this req", "error");
        response(res, err);
        return;
    }

    var url = adapters[provider].getAuthUrl();
    res.send(302, { location: url });
});

app.get('/authed', function(req, res) {
    var code = req.query.code;
    var provider = req.query.provider;
    if(!code || !provider) {
        res.send("auth error");
        return;
    }

    adapters[provider].getAccessToken(code, function(err, results) {
        if(err) {
            res.send("auth error");
            return;
        }
        
        var data = {
            username: '',
            password: '',
            access_token: results.access_token,
            expire_in: parseInt(tool.timestamp()) + parseInt(results.expires_in),
            provider: provider,
            weibo_user_id: results.uid,
            oauth_version: 2,
            refresh_token : results.refresh_token
        };

        if(provider == 'qq') {
            data.weibo_user_id = req.query.openid;
            data.qq_open_key = req.query.openkey;
            data.username = results.name;
        }
        accountMgr.create(data, function(err, result) {
            res.send([err, result]);
        });

    });
});

app.get("/testAuth", function(req, res) {
    if(req.query.accountId) {
        res.send("auth success! the accountId is " + req.query.accountId);
    } else {
        res.send(302, {location: 'http://local.gupiao123.cn:8899/auth?provider=qq&redirectUrl=' + encodeURI('http://local.gupiao123.cn:8899/testAuth')});
    }
});
app.listen(settings.server.port);
console.log("weibo server listen "+settings.server.port+", start at " + tool.getDateString());