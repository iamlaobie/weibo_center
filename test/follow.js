var hihttp = require('../lib/hihttp');
var task = {
            accountId:"10000", 
            weiboUserId:'2544851065',
            fromApp:'stockradar'};

hihttp.post('http://127.0.0.1:8080/weibo/follow', task, function(err, result){
    console.log([err, result]);
});