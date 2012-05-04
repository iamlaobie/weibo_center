var settings = require(__dirname + '/etc/settings.json');
var db = require('./lib/db').db;
db.init(settings);
var accounts;
db.loadAccounts(function(err, accs){
    accounts = accs;
});
var weibo = require('weibo');
weibo.init('tsina', settings.weibo.appkey, settings.weibo.secret);
var img = './1.jpg';


var rt = function(){
    //id=3425194263286765
    //id=3423440830350372
    var data = {id:'3427412488374320',user:accounts.jrj,page:1};
    weibo.tapi.repost_timeline(data, function(err, body, response){
        console.log(body);
    });

}


var sendTest = function(){
    var msg = '【收盘播报】最新8.86（+0.42，+4.98%），今开：8.86（+0.42，+4.98%），最高：8.86（+4.98%），最低：8.86（+4.98%），成交：7手（6202元），换手率：0.00%【资金流向】净流量：36.99万元';
    var send = function(account){
        var data = {status:msg, user:account};
        weibo.tapi.update(data, function(err, body){
            console.log([err, account, body]);
        });
    }
    //for(var i = 0; i < 10; i++){
        send(accounts['sz900002']);
    //}
}

var testLimit = function(){
    var data = {user:accounts.jrj};
    weibo.tapi.rate_limit_status(data, function(err, body, response){
        console.log([err, body]);
    }); 
}

var getWeibo = function(){
    var data = {user:accounts.sh601519, id:'3442005377826410'};
    weibo.tapi.status_show(data, function(err, body){
        console.log([err, body]);
    });
}


setTimeout(function(){
    //rt();
    getWeibo();
}, 1000);
