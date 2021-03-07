var express = require('express');
var router = express.Router()

// gkanswers
router.get('/gkanswers/:parent', async (req,res) => {
	const parent = req.params.parent;
	var result = await TopicService.GetTopic(parent);
		
	if (result[0].show_answers == "true"){
		var paper = await QuizService.GetQuiz(parent);
		console.log(paper)
		res.render('answers',{title:"answers" ,nav_selected:"answers", result:paper});
	}
	else res.render('error')
})

module.exports = router