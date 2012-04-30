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

		if(!data.status && !data.img){
			return "no text or img";
		}

		data.status = data.status || '';
		data.img = data.img || '';

		return "valid";
	},

	repost:function(data){

	}
}

module.exports = validator;