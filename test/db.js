var assert = require('assert');
var vows = require('vows');
var db = require("../lib/db");

var weibo = {
	status:"this is a test",
	img:'',
	id:'123456',
	weiboUrl:'http://google.com',
	accountId:100000,
	taskId:'111111111111111',
	provider:'sina',
	fromApp:'stockRadar'
};

var cb = function(err, result){
	console.log([err,result]);
}
//db.insertWeibo(weibo, cb);

//db.insertWeiboRepost('111111', '22222', '100000', '', cb);

db.getWeibo(1,  cb);