var settings = require("../etc/settings.json");
var mysql = require("mysql");
var cli = mysql.createClient(settings.mysql);
var account = require("../lib/account").init(cli);

setTimeout(function(){
	console.log(account.getAll());	
}, 1000);