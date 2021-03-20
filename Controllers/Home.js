var express = require('express');
var router = express.Router()

// home
router.get('/', (req,res) => {
	var editing_permission = false
    if (AuthService.IsLoggedIn(req)){
        editing_permission = true
    }
	res.render('home', {title:"Maths Partner", editing_permission, page:'home'})
	// res.redirect('/gk/null')
})

module.exports = router