var _ = require("underscore");
var db = require('../lib/db');
var tool = require('../lib/tool');
var hittp = require("../lib/hihttp");
var fs = require("fs");
var settings = require("../etc/settings.json");
module.exports = {
    apiAction: "update",

    pic: function(data, req) {
        if(data.picBase64) {
            var buf = new Buffer(data.picBase64, 'base64');
            var picBase64Data = buf.toString('binary');
            var pic = settings.pic + '/' + tool.uniqString();
            fs.writeFileSync(pic, picBase64Data, 'binary');
            return pic;
        }

        if(req.files && req.files.pic) {
            return req.files.pic.path;
        }
        return "";
    },

    receive: function(data, req) {
        if(!data.accountId) {
            return { msg: "no accountId", result: "error" };
        }

        if(!data.accountId.match(/^\d+$/)) {
            return { msg: "accountIds's format is not valid", result: "error" };
        }

        data.status = data.status || '';
        data.pic = this.pic(data, req);
        if(!data.status && !data.pic) {
            return { msg: "no text or img", result: "error" };
        }

        var task = _.clone(data);
        return { result: "ok", task: task };
    },

    prepare: function(task, callback) {
        callback(null, task);
    },

    finish: function(task, callback) {
        var resp = task.response;
        var data = task.data;
        var account = task.account;
        data.pic = data.pic || '';
        var taskId = task.taskId || '';
        task.status = data.status || '';
        var weibo = {
            status: decodeURI(data.status),
            pic: data.pic,
            id: resp.id.toString(),
            weiboUrl: resp.t_url,
            accountId: account.id,
            taskId: taskId,
            provider: account.provider,
            fromApp: task.fromApp
        };
        db.insertWeibo(weibo, function(err, result) {
            if(!err) {
                task.weiboDbId = result.insertId;
            }
            console.log([err, result]);
            callback(err, task);
        });
    },

    report: function(task) {
        var body = {
            taskId: task.taskId,
            action: task.action,
            accountId: task.account.accountId,
            result: task.result,
            fromApp: task.fromApp,
            retry: 0
        };

        body.msg = '';
        if(task.err) {
            body.msg = task.err.message;
        } else {
            var resp = task.response;
            body.weiboId = resp.id.toString();
            body.weiboUrl = resp.t_url;
            body.weiboDbId = task.weiboDbId;
        }
        return body;
    },

    log: function(task) {
        var report = this.report(task);
        var weiboId = report.weiboId || '-';
        var weiboDbId = report.weiboDbId || '-';
        var weiboUrl = report.weiboUrl || '-';
        var pic = task.data.pic || '-';
        var log = ['"' + task.data.status + '"', pic, weiboId, weiboUrl, weiboDbId, report.msg];
        return log.join("\t");
    },

    error: function(err, task) {
        if(err.message.match(/timeout/i)) {
            return "retry";
        }

        if(err.message.match(/^40(308|090|310)/)) {
            return "limit";
        }

        if(err.message.match(/^400(13|25)/)) {
            return "drop";
        }
        return "retry";
    }

};