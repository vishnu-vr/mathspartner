var express = require('express')
const QuizService = require('../Services/QuizService')
const TopicService = require('../Services/TopicService')
var router = express.Router()

// gk quiz
router.get('/gkquiz/:quiz/:mode', async (req,res) =>{
	var quiz = req.params.quiz
	quiz = quiz.toUpperCase()
	console.log(quiz)

	var editing_permission = false
	if (AuthService.IsLoggedIn(req)) editing_permission = true;

	// check whether the quiz is on or off
	var result = await TopicService.GetTopic(quiz);

	// if returned empty list
	if (result.length == 0){
		res.render('error')
		return
	}
	// if the quiz is off don't return the quiz
	if (result[0]==null) {
		res.render('error')
		return
	}
	if (result[0].on_off == 'false' && req.params.mode == 'normal' && editing_permission == false){
		var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
		fullUrl = fullUrl.split('/')
		fullUrl[fullUrl.length - 1] = "test"
		fullUrl = fullUrl.join('/')
		res.redirect(fullUrl)
		return
	}
	// console.log('asd')
	var on_off = result[0].on_off
	var show_answers = result[0].show_answers
	var duration = result[0].duration
	var pdf_path = result[0].pdf_path

	// getting the entire quiz from papers collection
	var paper = await QuizService.GetQuiz(quiz);
	paper = paper[0];
	console.log(paper)
	var questions_and_answers_list = paper.questions_and_answers_list;

	var questions = []
	questions_and_answers_list.forEach(qa => {
		questions.push({
			question:qa.question,
			options:qa.options,
			correct:qa.correct,
			section:qa.section})
	});

	var grouped_questions = {}
	questions.forEach(question => {
		// shuffling the options
		help.shuffle(question.options)

		// regrouping the questions with respective to different sections
		// if the section exists in the dic then push it to the list
		if (question.section in grouped_questions){
			grouped_questions[question.section].push(question)
		}
		// else create a new key and empty list as the corresponding value
		// and then push it
		else {
			grouped_questions[question.section] = []
			grouped_questions[question.section].push(question)
		}
	});

	// emptying the questions list
	questions = []
	// Object.values(grouped_questions) - this gets the values as a list
	// from a dictionary
	Object.values(grouped_questions).forEach(values => {
		// taking list of questions from a section
		// and shuffling them
		help.shuffle(values)
		// taking each question from the list of questions
		// and appending them to questions list
		values.forEach(value => {
			questions.push(value)
		});
	});

	// checking the mode
	if (req.params.mode == 'test') var mode = 'test'
	else var mode = 'normal'

	res.render('quiz_box', 
		{
			grouped_questions:grouped_questions,
			title:"quiz_box",
			nav_selected:"gk",
			heading:quiz,
			questions:questions,
			time:duration,
			pdf_path:pdf_path,
			mode:mode,
			on_off,
			show_answers,
			editing_permission
		})
})

// gk_edit_quiz
router.put('/gk_edit_quiz', async (req,res) =>{
	console.log(req.body)
	if (!AuthService.IsLoggedIn(req)){
		console.log('unautherized request')
		res.json('not autherized')
		return
	}

	var data = req.body
	var quizName = data[0].whole_quiz_name;
	var pdfPath = data[0].pdf_path;
	var duration = data[0].duration*60;

	if (req.body[0].show_answers_switch) var showAnswers = 'true'
	else var showAnswers = 'false'

	if (data[0].on_off) var onOff = 'true'
	else var onOff = 'false'

	// building questions_and_answers_list
	var questions_and_answers_list = [];
	data.forEach(dataSingle => {
		var qa = QuizService.GetQuestionsAndAnswersModel(
			dataSingle.question,
			dataSingle.correct,
			dataSingle.section,
			dataSingle.options);

		// appending the qa model to list
		questions_and_answers_list.push(qa);
	});
	await QuizService.UpdatePaper(quizName, questions_and_answers_list);

	// updating meta data
	await QuizService.UpdateQuizTopicMetaData(quizName, pdfPath, duration, showAnswers, onOff);

	res.json('success');
})

// gk_add_quiz
// changed**
router.post('/gk_add_quiz', async (req,res) =>{
	console.log(req.body)
	if (!AuthService.IsLoggedIn(req)){
		console.log('unautherized request')
		res.json('not autherized')
		return
	}

	// adding parent and child
	// generating topic model
	var topicModel = TopicService.GetTopicModel(
		req.body[0].parent_child_details.parent,
		req.body[0].parent_child_details.child,
		"",
		"",
		"",
		"quiz",
		"",
		"");

	// inserting topic
	await TopicService.AddTopic(topicModel);
	

	// adding parent+child and null (to indicate quiz)
	if (req.body[0].parent_child_details.parent == 'null')  var new_parent = req.body[0].parent_child_details.child
	else var new_parent = req.body[0].parent_child_details.parent + '-' + req.body[0].parent_child_details.child
	
	var new_child = 'null'

	if (req.body[0].on_off) var on_off = 'true'
	else var on_off = 'false'

	if (req.body[0].show_answers_switch) var show_answers = 'true'
	else var show_answers = 'false'

	var pdfPath = req.body[0].pdf_path;

	// generating topic model
	var topicModel = TopicService.GetTopicModel(
		new_parent,
		new_child,
		on_off,
		req.body[0].duration*60,
		pdfPath,
		"quiz",
		"",
		show_answers);

	// inserting topic
	await TopicService.AddTopic(topicModel);

	var table_name = new_parent.toString().toUpperCase()
	var data = req.body

	// building questions_and_answers_list
	var questions_and_answers_list = [];
	data.forEach(dataSingle => {
		var qa = QuizService.GetQuestionsAndAnswersModel(
			dataSingle.question,
			dataSingle.correct,
			dataSingle.section,
			dataSingle.options);

		// appending the qa model to list
		questions_and_answers_list.push(qa);
	});
	// generatng paper/quiz model
	var paperModel = QuizService.GetPaperModel(table_name, questions_and_answers_list);
	// inserting the quiz/paper into paper collection
	await QuizService.AddPaper(paperModel);

	console.log("Table created");
	res.json("success")
})

module.exports = router