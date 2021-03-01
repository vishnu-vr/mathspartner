var express = require('express');
var router = express.Router()

// rank_page
router.get('/user_ranks', (req,res) =>{
	var editing_permission = false
	if (AuthService.IsLoggedIn(req)){
		editing_permission = true;
	}
	res.render('user_ranks',{title:"Rank", nav_selected:'user_ranks', editing_permission})
})

// save_user_results
// changed**
router.post('/save_user_results', async (req,res) => {
	console.log(req.body)
	const data = req.body

	var userResultModel = UserResultService.GetUserResultModel(
		data.name, 
		parseFloat(data.score),
		data.correct,
		data.wrong,
		data.na,
		data.date,
		data.quiz_name,
		data.time_taken);

	await UserResultService.AddUserResult(userResultModel);

	res.json("success")
	// sending an event message to rank page
	io.emit('new_data', {'message':'hit_refresh'})
})

// get_user_details
router.post('/get_user_details', async (req,res) =>{
	const date_chosen = req.body.date_chosen
	console.log(date_chosen)
	var result = await UserResultService.GetResults(date_chosen);
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

module.exports = router