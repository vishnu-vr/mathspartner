var express = require('express')
var router = express.Router()

// audio
router.get('/audio/:parent/:id', (req,res) =>{
	var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		editing_permission = true
		console.log('user logged in')
	}
	console.log(req.params.parent)
	res.render('audio', {title:"audio", audio_name: req.params.parent,nav_selected:"gk", src:req.params.id, editing_permission})
})

// gkaddaudio
// changed**
router.post('/gkaddaudio', (req,res) =>{
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

	// adding parent and child
	new_con.query("INSERT INTO `gk` (`id`, `parent`, `child`, `on_off`, `duration`, `pdf_path`, `type`) VALUES (NULL, ?, ?, '', '', '', 'audio');", [req.body.parent, req.body.child], function(err, result, fields) {
		if (err){
			console.log(err)
			res.json('failed')
			return
		}
		// adding parent+child and null (to indicate quiz)
		if (req.body.parent == 'null')  var new_parent = req.body.child
		else var new_parent = req.body.parent + '-' + req.body.child
		var new_child = 'audio'
		var id = req.body.link.split('/')[5]
		new_con.query("INSERT INTO `gk` (`id`, `parent`, `child`, `on_off`, `duration`, `pdf_path`, `type`) VALUES (NULL, ?, ?, '', '', ?, 'audio');", [new_parent, new_child, id], function (err, result, fields) {
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