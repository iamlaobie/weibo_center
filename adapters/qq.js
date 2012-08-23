var util = require("util");
var AdapterBase = require("./base.js");
var urls = {
    root:"https://open.t.qq.com",
    auth:"/cgi-bin/oauth2/authorize",
    accessToken:"/cgi-bin/oauth2/access_token",
    update:"/api/t/add",
    userInfo:"/api/user/info"
};
var QQ = function(options) {
    var _self = this;
    this.provider = 'qq';
    this.urls = urls;
    this.settings = options.settings;
    this.appkey = options.settings.providers.qq.appkey;
    this.secret = options.settings.providers.qq.secret;
    this.setOAuth();

    this.formatResult = function(err, result) {
        var std = { err: null, result: result };
        if(err) {
            if(!err.msg) {
                std.err = { msg: 'unknow error', detail: err }
            } else {
                std.err = { msg: err.msg, detail: err };
            }
        }

        if(result.errcode != 0) {
            std.err = { msg: result.msg };
        }
        return std;

    };

    this.update = function(task, callback) {
        var data = task.data;
        var d = {
            content: data.status
        };
        if(data.pic) {

        } else {
            this.post(this.urls.update, task.account, d, function(err, result) {
                if(!err) {
                    task.response = { id: result.data.id, t_url: '' };
                }
                callback(err, task);
            });
        }
    }

    this.userInfo = function(account, data, callback) {
        _self.get(this.urls.userInfo, account, {}, function(err, result) {
            var stdResult = _self.formatResult(err, result);
        });
    };

}
//util.inherits(QQ, AdapterBase);
QQ.prototype = new AdapterBase();
module.exports = QQ;