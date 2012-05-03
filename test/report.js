var settings = require("../etc/settings.json");
var Queue = require('../lib/queue').Queue;
var redis = require("redis");
var redisClient = redis.createClient(settings.redis.port, settings.redis.host);
redisClient.select(settings.redis.db);

var reportQueue = new Queue(settings.reportQueue.name, redisClient);

var report = {
            taskId:'111111111',
            action:'update',
            accountId:'10001',
            result:'error',
            fromApp:'stockradar',
            retry:0,
            msg:"not found the account"
};
reportQueue.push(report);