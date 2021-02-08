var express = require('express')
var router = express.Router()

// register_class payment
router.post('/register_class', (req,res) =>{
	console.log(req.body)
	if (req.body.email.includes('@') == false || req.body.email.includes('.com') == false){
		res.json('invalid email id')
		return
	}
	res.json('success')
})

// register
router.get('/register/:class_name', (req,res) =>{
	var class_name = req.params.class_name.toUpperCase()
	new_con.query('SELECT * FROM gk WHERE parent = ? AND child = ?', ['ONLINE CLASS',class_name], function(err, result, fields){
		if (err){
			res.render('error')
			return
		}
		if (result.length == 0){
			res.render('error')
			return
		}
		else res.render('register_class',{title:'Register', class_name})
		console.log(result)
	})
})

// new_online_class_submit
router.post('/new_online_class', (req,res) => {
	console.log(req.body)
	new_con.query("INSERT INTO `gk` (`id`, `parent`, `child`, `type`, `date`) VALUES (NULL, ?, ?, ?, ?);", [req.body.parent, req.body.child, 'online_class', req.body.date+'##'+req.body.time], function(err, result, fields){
		if (err){
			console.log(err)
			return
		}
		res.json('success')
	})
})

module.exports = router