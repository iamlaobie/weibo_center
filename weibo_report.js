var settings = require("./etc/settings.json");
var Queue = require('./lib/queue');
var async = require('aysnc');
var redis = require("redis");
redis.createClient(settings.redis.port, settings.redis.host);
var redisClient = redis.select(settings.redis.db);
var runLogger = require('./lib/logger').logger("report.log");

var reportQueue = new Queue(settings.reportQueue.name, redisClient);


