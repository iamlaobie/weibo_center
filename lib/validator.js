var actions = ['send', 'repost', 'comment', 'followe']
var validator = {
	validate : function(action, data){
		if(!this[action] || actions.indexOf(action) == -1){
			return "Unkown action";
		}
		return validator[action](data);
	},

	send:function(data){
		if(!data.accountIds){
			return "no accountIds";
		}

		if(!data.accountIds.match(/\d+/)){
			return "accountIds's format is not valid";
		}

		if(!data.text){
			return "no text";
		}
		return "valid";
	},

	repost:function(data){

	}
}

module.exports = validator;