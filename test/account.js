var settings = require("../etc/settings.json");
var mysql = require("mysql");
var cli = mysql.createClient(settings.mysql);
var account = require("../lib/account").init(cli);

setTimeout(function(){
	var acc = { 
		id:'10000',
		weibo_user_id : '1722869381',
		username: 'iamlaobie@gmail.com',
  password: 'lj19830615',
  access_token: '89b2b01513e9f1d8d9664feb44eefcb5',
  access_token_secret: 'ea80288d57da52aa6908a88856e0b4aa',
  blogtype:'tsina',
  authtype:'oauth'
};
	account.update(acc, function(err, info){
		console.log([err, info]);
	});
}, 1000);