var express = require('express')
var router = express.Router()

// login
router.get('/login', (req,res) => {
	const redirect_url = req.originalUrl.split("=")
	res.render('login', {title:"login", none:"none", heading:"LOGIN", current_url:redirect_url[1]})
})

// logout
router.get('/logout', (req,res) => {
	if (req.session.logged_in != null){
        req.session.logged_in = false
		const redirect_url = req.originalUrl.split("=")
		res.redirect(redirect_url[1])
	}
	else res.redirect('/')
})

// login verification
router.post('/user_authentication', (req,res) => {
	console.log(req.body)
	new_con.query("SELECT * FROM login where username = ?",[req.body.username] , function (err, result, fields) {
		if (err){
			console.log(err)
			res.json('failed')
			return
		}
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
	});
})

module.exports = router