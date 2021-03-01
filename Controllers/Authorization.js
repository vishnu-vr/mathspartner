var express = require('express')
var router = express.Router()

// login
router.get('/login', (req,res) => {
	const redirect_url = AuthService.LogIn(req)
	res.render('login', {title:"login", none:"none", heading:"LOGIN", current_url:redirect_url})
})

// logout
router.get('/logout', (req,res) => {
	res.redirect(AuthService.LogOut(req));
})

// user verification
router.post('/user_authentication', async (req,res) => {
	console.log(req.body)
	var result = await AuthService.GetUserDetails(req.body.username);

	// if no such user exits
	if(result.length == 0){
		res.json('failed')
		console.log('no such user exits')
		return
	}
	if (result[0].password == req.body.password && result[0].permission == req.body.permission){
		req.session.logged_in = true
		req.session.permission = result[0].permission
		res.json("success")
	}
	else{
		res.json("failed")
	}
})

module.exports = router