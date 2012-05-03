var hihttp = require('../lib/hihttp');
var task = {
            accountId:"12307", 
            tags:"行情股票资讯龙虎榜A股",
            fromApp:'stockradar'};

hihttp.post('http://127.0.0.1:8080/weibo/addTag', task, function(err, result){
    console.log([err, result]);
});