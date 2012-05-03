var hihttp = require('../lib/hihttp');
var task = {accountIds:'12307',
            weiboDbId:"11", 
                fromApp:'stockradar', 
                status:"test repost too too"};

hihttp.post('http://127.0.0.1:8080/weibo/repost', task, function(err, result){
    console.log([err, result]);
});