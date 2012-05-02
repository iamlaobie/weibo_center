var hihttp = require('../lib/hihttp');
var sendTask = {taskId:'12434235435436546546',accountIds:'10001,10000', 
				fromApp:'stockRadar', action:"update", 
				status:"this is a test too too too too too too too too"};

hihttp.post('http://127.0.0.1:8080/weibo/update', sendTask, function(err, result){
	console.log([err, result]);
});