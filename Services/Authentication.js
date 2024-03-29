module.exports = {
	IsLoggedIn: function(req){
		if (req.session.logged_in != null && req.session.logged_in == true){
			console.log('user logged in')
			return true
		}
		return false;
	},
	LogOut: function(req){
		if (req.session.logged_in != null){
			req.session.logged_in = false
			const redirect_url = req.originalUrl.split("=")
			return redirect_url[1];
		}
		else return "/";
	},
	LogIn: function(req){
		const redirectUrl = req.originalUrl.split("=");
		return redirectUrl[1];
	},
	GetUserDetails: async function (username){
		try{
			var dbo = db.db(DB.mathspartner);
	  		var query = { username: username };
	  		var result = await dbo.collection(DB.login).find(query).toArray();
	  		return result;
		}
		catch(error){
			console.error(error)
		}
	},
}