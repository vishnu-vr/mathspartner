var express = require('express')
var router = express.Router()

// gkanswers
router.get('/gkanswers/:parent', (req,res) => {
	const parent = req.params.parent;
	new_con.query("SELECT show_answers FROM gk where parent = ?",[parent] , function (err, result, fields){
		if (err){
			console.log(err)//throw err;
			res.send("<h1>something went wrong</h1>")
			return
		}
		if (result[0].show_answers == "true"){
			new_con.query("SELECT * FROM ??",[parent] , function (err, result, fields){
				if (err){
					console.log(err)//throw err;
					res.send("<h1>something went wrong</h1>")
					return
				}
				res.render('answers',{title:"answers" ,nav_selected:"answers", result});
			})
		}
		else res.render('error')
	})
})

module.exports = router