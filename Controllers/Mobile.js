var express = require('express')
const UserResultService = require('../Services/UserResultService')
var router = express.Router()

// APIS FOR THE MOBILE APP
// will return list of unique quiz names
router.post('/get_list_of_quiz', async (req,res)=>{
	var result = await UserResultService.GetQuizList();
	console.log(result[0])
	res.json(result);
})

// will return user details rank wise
router.post('/user_details_from_quiz_name', async (req,res) => {
	const quizName = req.body.quiz_name;
	var result = await UserResultService.GetResultsByQuizName(quizName);
	res.json(result);
})

router.post('/delete_user_result', async (req,res) => {
	const id = req.body.row_id;
	console.log(id);
	await UserResultService.DeleteUserResultById(id);
	res.json("success");
})

module.exports = router