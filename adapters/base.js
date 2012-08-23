var OAuth2 = require('../lib/oauth2').OAuth2;
var hihttp = require('../lib/hihttp');
var qs = require("querystring");
var AdapterBase = function() {
    this.setOAuth = function() {
        var conf = this.settings.providers[this.provider];
        this.oauth2 = new OAuth2(conf.appkey,
                        conf.secret,
                        this.urls.root,
                        this.urls.auth,
                        this.urls.accessToken);
    };

    this.getParams = function(params, account) {
        params = params || {};
        params.oauth_consumer_key = this.appkey;
        params.oauth_version = '2.a';
        params.scope = 'all';
        params.access_token = account.access_token;
        if(this.provider == 'qq') {
            params.openid = account.weibo_user_id;
        }

        if(!params.clientip) {
            params.clientip = '127.0.0.1';
        }
        return params;
    };

    this.upload = function(url, file, params, callback) {
        var _self = this;
        var fullUrl = this.urls.root + url;
        params = this.getParams(params, account);
        hihttp.upload(fullUrl, file, params, function(err, result) {
            console.log([err, result]);
            var stdResult = _self.formatResult(err, result);
            if(stdResult.err) {
                callback(stdResult.err);
            } else {
                callback(null, stdResult.result);
            }
        });
    },

    this.get = function(url, account, params, callback) {
        var _self = this;
        var fullUrl = this.urls.root + url;
        params = this.getParams(params, account);
        hihttp.get(fullUrl, params, function(err, result) {
            console.log([err, result]);
            var stdResult = _self.formatResult(err, result);
            if(stdResult.err) {
                callback(stdResult.err);
            } else {
                callback(null, stdResult.result);
            }
        });
    };

    this.post = function(url, account, params, callback) {
        var _self = this;
        var fullUrl = this.urls.root + url;
        params = this.getParams(params, account);
        hihttp.post(fullUrl, params, function(err, result) {
            console.log([err, result]);
            var stdResult = _self.formatResult(err, result);
            if(stdResult.err) {
                callback(stdResult.err);
            } else {
                callback(null, stdResult.result);
            }
        });
    };

    this.formatResult = function(err, result) {
        return { err: err, result: result };
    };

    this.getAuthUrl = function(params) {
        var redirectUrl = this.settings.server.urlRoot + "authed?provider=" + this.provider;
        if(params) {
            redirectUrl += "&" + qs.stringify(params);
        }
        return url = this.oauth2.getAuthorizeUrl({ redirect_uri: redirectUrl, response_type: 'code' });
    };

    this.getAccessToken = function(code, callback) {
        var params = {
            grant_type: 'authorization_code',
            redirect_uri: this.settings.server.urlRoot + "authed?provider=" + this.provider
        };

        this.oauth2.getOAuthAccessToken(code, params, function(err, result) {
            callback(err, result);
        });
    };
}

module.exports = AdapterBase;