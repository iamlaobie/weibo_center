var update = require(__dirname + '/update');
var repost = require(__dirname + '/repost');
var deleteWeibo = require(__dirname + '/deleteWeibo');
var deleteRepost = require(__dirname + '/deleteRepost');
var addTag = require(__dirname + '/addTag');
var comment = require(__dirname + '/comment');
var follow = require(__dirname + '/follow');

module.exports = {
	update:update,
    repost:repost,
    deleteWeibo:deleteWeibo,
    deleteRepost:deleteRepost,
    addTag:addTag,
    comment:comment,
    follow:follow
};