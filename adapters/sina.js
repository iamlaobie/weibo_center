var util = require("util");
var AdapterBase = require("./base.js");
var urls = {
    root:"http://api.weibo.com",
    auth:"/oauth2/authorize",
    accessToken:"/oauth2/access_token",
    update:"/2/statuses/update.json"
};
var Sina = function(options) {
    this.provider = 'sina';
    this.urls = urls;
    this.settings = options.settings;
    this.setOAuth();

    this.update = function(accessToken, data, callback) {
        var url = urls.root + urls.update;
        this.oauth2._request('POST', url, {}, data, accessToken, function(err, result, response) {
            cosole.log([err, result]);
        });
    }
}

Sina.prototype = new AdapterBase();
module.exports = Sina;