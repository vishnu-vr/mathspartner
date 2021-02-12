var express = require('express')
var router = express.Router()

// simple youtube
router.get('/youtube/:parent/:src', (req,res) =>{
	var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		editing_permission = true
		console.log('user logged in')
	}
	// editing_permission
	res.render('youtube',{title:"YouTube", nav_selected:"classes", heading:req.params.parent, link:req.params.src, editing_permission})
})

// gkaddyoutube
// changed**
router.post('/gkaddyoutube', (req,res) =>{
	console.log(req.body)
	if (req.session.logged_in != null && req.session.logged_in == true){
		// editing_permission = true
		console.log('user logged in')
	}
	else{
		console.log('user not autherized')
		res.json('user not autherized')
		return
	}

	var splitted = req.body.link.trim().split(' ')
	splitted = splitted[3].split('"')
	var id = splitted[1]
	// checking whether the link contains '?' question mark
	// ie if the link is taken from a playlist
	id = id.split('?')
	id = id[0]

	// adding parent and child
	new_con.query("INSERT INTO `gk` (`id`, `parent`, `child`, `on_off`, `duration`, `pdf_path`, `type`) VALUES (NULL, ?, ?, '', '', ?, 'youtube');", [req.body.parent, req.body.child, id], function(err, result, fields) {
		if (err){
			console.log(err)
			res.json('failed')
			return
		}
		// adding parent+child and null (to indicate quiz)
		if (req.body.parent == 'null')  var new_parent = req.body.child
		else var new_parent = req.body.parent + '-' + req.body.child
		var new_child = 'youtube'
				
		new_con.query("INSERT INTO `gk` (`id`, `parent`, `child`, `on_off`, `duration`, `pdf_path`, `type`) VALUES (NULL, ?, ?, '', '', ?, 'youtube');", [new_parent, new_child, id], function (err, result, fields) {
			if (err) {
				console.log(err)
				res.json('failed')
				return
			}
			res.json('success')
		})
	})
})

module.exports = router