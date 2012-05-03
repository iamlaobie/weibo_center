var hihttp = require('../lib/hihttp');
var task = {
            repostDbIds:"1,2", 
                fromApp:'stockradar'};

hihttp.post('http://127.0.0.1:8080/weibo/deleteRepost', task, function(err, result){
    console.log([err, result]);
});