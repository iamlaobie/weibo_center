var validator = {
	validate : function(action, data){
		if(!this[action]){
			return "Unkown action";
		}
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

	},

	accountIds : function(){
		
	}
	
}

module.exports = validator;