var express = require('express')
var router = express.Router()

// rank_page
router.get('/user_ranks', (req,res) =>{
	var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		editing_permission = true
		console.log('user logged in')
	}
	res.render('user_ranks',{title:"Rank", nav_selected:'user_ranks', editing_permission})
})

// save_user_results
// changed**
router.put('/save_user_results', (req,res) => {
	console.log(req.body)
	const data = req.body
	var sql = "INSERT INTO `user_details` (`id`, `name`, `score`, `correct`, `wrong`, `na`, `date`, `quiz_name`, `time_taken`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?)"
	new_con.query(sql, [data.name, parseFloat(data.score), data.correct, data.wrong, data.na, data.date, data.quiz_name, data.time_taken], function (err, result) {
		if (err) {
			console.log(err)
			res.json("failed")
			return
		}
		res.json("success")
		// sending an event message to rank page
		io.emit('new_data', {'message':'hit_refresh'})
	});
})

// get_user_details
router.post('/get_user_details', (req,res) =>{
	const date_chosen = req.body.date_chosen
	console.log(date_chosen)
	new_con.query("SELECT * FROM `user_details` WHERE `date` = ? ORDER BY score DESC,time_taken ASC", [date_chosen], function (err,result) {
		if (err){
			console.log(err)
			res.json(null)
			return
		}
		
		// console.table(result)
		var already_seen_quiz_names = []
		var data = {}
		for (var i=0; i<result.length; i++){
			if (already_seen_quiz_names.includes(result[i].quiz_name)){
				data[result[i].quiz_name].push(result[i])
			}
			else{
				already_seen_quiz_names.push(result[i].quiz_name)
				data[result[i].quiz_name] = []
				data[result[i].quiz_name].push(result[i])
			}
		}

		res.json({already_seen_quiz_names,data})
	})
})

module.exports = router