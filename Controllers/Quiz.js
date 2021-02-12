var express = require('express')
var router = express.Router()

// gk quiz
router.get('/gkquiz/:quiz/:mode', (req,res) =>{
	var quiz = req.params.quiz
	quiz = quiz.toUpperCase()
	console.log(quiz)

	var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		editing_permission = true
		console.log('user logged in')
	}

	// check whether the quiz is on or off
	new_con.query("SELECT * FROM gk WHERE parent = ?", [quiz], function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render('error')
			return
		}
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
			// res.send("<h1>THIS QUIZ IS TEMPORARLY TURNED OFF. TRY AGAIN AFTER SOMETIME.")
			// res.render('error')
			// return
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

		new_con.query("SELECT * FROM ??", [quiz], function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.render('error')
				return
			}
			// console.log(result);
			var questions = []
			for (var i=0; i<result.length; i++){
				var options = []
				options.push(result[i].option_1)
				options.push(result[i].option_2)
				options.push(result[i].option_3)
				options.push(result[i].option_4)
				questions.push({question:result[i].question, options:options, correct:result[i].correct, section:result[i].section})
			}
			// console.log(questions)

			// shuffling the questions
			// help.shuffle(questions)

			var grouped_questions = {}
			for (var i=0; i<questions.length; i++) {
				// shuffling the options
				help.shuffle(questions[i].options)

				// regrouping the questions with respective to different sections
				// if the section exists in the dic then push it to the list
				if (questions[i].section in grouped_questions){
					grouped_questions[questions[i].section].push(questions[i])
				}
				// else create a new key and empty list as the corresponding value
				// and then push it
				else {
					grouped_questions[questions[i].section] = []
					grouped_questions[questions[i].section].push(questions[i])
				}
			}

			// emptying the questions list
			questions = []
			// Object.values(grouped_questions) - this gets the values as a list
			// from a dictionary
			for (i=0; i<Object.values(grouped_questions).length; i++) {
				// taking list of questions from a section
				// and shuffling them
				help.shuffle(Object.values(grouped_questions)[i])
				// taking each question from the list of questions
				// and appending them to questions list
				for (var j=0; j<Object.values(grouped_questions)[i].length; j++){
					questions.push(Object.values(grouped_questions)[i][j])
				}
			}

			// checking the mode
			if (req.params.mode == 'test') var mode = 'test'
			else var mode = 'normal'

			res.render('quiz_box', {grouped_questions:grouped_questions, title:"quiz_box", nav_selected:"gk", heading:quiz, questions:questions, time:duration, pdf_path:pdf_path, mode:mode, on_off, show_answers, editing_permission})
		});
	});
})

// gk_edit_quiz
router.put('/gk_edit_quiz', (req,res) =>{
	console.log(req.body)
	if (req.session.logged_in == null || req.session.logged_in == false){
		console.log('unautherized request')
		res.json('not autherized')
		return
		// console.log("USER NOT LOGGED IN")
	}
	// res.json('success')
	// return
	new_con.query("TRUNCATE TABLE ??", [req.body[0].whole_quiz_name], function (err,result,fields) {
		if (err) {
			console.log(err)
			res.json('failed')
			return
		}
		// after emptying the table completely
		// add the rows again
		var data = req.body
		for (var i=0; i<data.length; i++){
			var sql = "INSERT INTO ?? VALUES ("+(i+1)+", ?, ?, ?, ?, ?, ?, ?)";
			new_con.query(sql, [req.body[0].whole_quiz_name, data[i].question, data[i].options[0], data[i].options[1], data[i].options[2], data[i].options[3], data[i].correct, data[i].section], function (err, result) {
			if (err) {
				console.log(err)//throw err;
				console.log("row " +(i+1)+" failed");
			}
			console.log("row " +(i+1)+" inserted");
			});

			// if (i == data.length - 1) res.json('success')
		}
		// console.log(req.body[0])
		if (req.body[0].on_off) var on_off = 'true'
		else var on_off = 'false'

		if (req.body[0].show_answers_switch) var show_answers = 'true'
		else var show_answers = 'false'

		new_con.query("UPDATE gk SET show_answers = ? WHERE parent = ?",[show_answers, req.body[0].whole_quiz_name],function (err,result,fields){
			if(err){
				console.log(err)
				res.json('failed')
			}
		})

		new_con.query("UPDATE gk SET on_off = ? WHERE parent = ?", [on_off, req.body[0].whole_quiz_name], function (err,result,fields) {
			if (err) {
				console.log(err)
				res.json('failed')
				return
			}
			new_con.query("UPDATE gk SET duration = ? WHERE parent = ?", [req.body[0].duration*60, req.body[0].whole_quiz_name], function (err,result,fields) {
				if (err) {
					console.log(err)
					res.json('failed')
					return
				}
				res.json('success')
			});
		});
	});	
})

// gk_add_quiz
// changed**
router.post('/gk_add_quiz', (req,res) =>{
	console.log(req.body)
	if (req.session.logged_in == null || req.session.logged_in == false){
		console.log('unautherized request')
		res.json('not autherized')
		return
		// console.log("USER NOT LOGGED IN")
	}
	// adding parent and child
	new_con.query("INSERT INTO `gk` (`id`, `parent`, `child`, `on_off`, `duration`, `pdf_path`, `type`) VALUES (NULL, ?, ?, '', '', '', 'quiz');", [req.body[0].parent_child_details.parent, req.body[0].parent_child_details.child], function(err, result, fields) {
		if (err){
			console.log(err)
			res.json('failed')
			return
		}
		// adding parent+child and null (to indicate quiz)
		if (req.body[0].parent_child_details.parent == 'null')  var new_parent = req.body[0].parent_child_details.child
		else var new_parent = req.body[0].parent_child_details.parent + '-' + req.body[0].parent_child_details.child
		
		var new_child = 'null'

		if (req.body[0].on_off) var on_off = 'true'
		else var on_off = 'false'

		if (req.body[0].show_answers_switch) var show_answers = 'true'
		else var show_answers = 'false'

		console.log("###############################")
		console.log(req.body[0].show_answers_switch)
		console.log("###############################")

		new_con.query("INSERT INTO `gk` (`id`, `parent`, `child`, `on_off`, `duration`, `pdf_path`, `type`, `show_answers`) VALUES (NULL, ?, ?, ?, ?, '', 'quiz', ?);", [new_parent, new_child, on_off, req.body[0].duration*60, show_answers], function (err, result, fields) {
			if (err) {
				console.log(err)
				res.json('failed')
				return
			}
			// console.log("ASdasdasdasdadasdasdasd")
			// adding quiz table
			var table_name = new_parent.toString().toUpperCase()
			var sql = "CREATE TABLE ?? ( `id` INT NOT NULL AUTO_INCREMENT ,  `question` VARCHAR(2550) NOT NULL , `option_1` VARCHAR(2550) NOT NULL , `option_2` VARCHAR(2550) NOT NULL , `option_3` VARCHAR(2550) NOT NULL , `option_4` VARCHAR(2550) NOT NULL , `correct` VARCHAR(2550) NOT NULL , `section` VARCHAR(2550) NOT NULL , PRIMARY KEY  (`id`))"
			var data = req.body
			new_con.query(sql, [table_name], function (err, result) {
				if (err) {
					console.log(err)//throw err;
					res.json('failed')
					return
				}
				console.log("Table created");
				// then add the questions
				for (var i=0; i<data.length; i++){
					var sql = "INSERT INTO ?? VALUES ("+(i+1)+", ?, ?, ?, ?, ?, ?, ?)";
					new_con.query(sql, [table_name, data[i].question, data[i].options[0], data[i].options[1], data[i].options[2], data[i].options[3], data[i].correct, data[i].section], function (err, result) {
					if (err) {
						console.log(err)//throw err;
						console.log("row " +(i+1)+" failed");
					}
					console.log("row " +(i+1)+" inserted");
					});
				}
				// return
				res.json("success")
			});
		});
	});
})

module.exports = router