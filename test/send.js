var hihttp = require('../lib/hihttp');
var sendTask = {accountId:'2', 
				fromApp:'stockradar', action:"update", 
				status:"this is a test too too too too too too too too"};

hihttp.post('http://127.0.0.1:8899/weibo/update', sendTask, function(err, result){
	console.log([err, result]);
});