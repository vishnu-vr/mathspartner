const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const help = require('./helper_functions')
var creds = require('./creds')
// const mysql = require('mysql2/promise');//require('mysql');
const mysql = require('mysql2');
// const { table, Console } = require('console')
// const { json } = require('express')
const session = require('express-session')
const fileupload = require('express-fileupload')
const fs = require('fs');
const { spawn } = require("child_process");

var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};


const new_con = mysql.createPool({
	host: creds.host,
	user: creds.user,
	password: creds.password,
	database: creds.database,
	charset: "utf8_general_ci"
});


// con.connect(function(err) {
// 	if (err) throw err;
// 	console.log("Database Connected!");
// });

const app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

// initializing handlebar template engine
app.engine('handlebars', exphbs({defaultLayout: 'main',
						helpers: { json: (context) => JSON.stringify(context) }}
						));
app.set('view engine', 'handlebars');

// ############## MIDDLEWARES ###################
// middleware - logger
const logger = (req,res,next) => {
	console.log(`log : ${req.protocol}://${req.get('host')}${req.originalUrl}`)
	// console.log(JSON.stringify(req.body))
	next()
}

// fileupload
app.use(fileupload())

// public
app.use(express.static(path.join(__dirname, '/public')));
// initializing the logger middleware
app.use(logger)
// initializing body parser
app.use(express.json())
// for handling url encoded data. ie html forms
app.use(express.urlencoded({ extended:false }))
// for session
app.use(session({secret:creds.secret,resave:false,saveUninitialized:true}))
// ############## MIDDLEWARES ###################

// ########################### HTML RENDERING ###########################################

// // landing_page
// app.get('/', (req,res) => {
// 	// res.render('home', {title:"Maths Partner"})
// 	res.redirect('/gk/null')
// })

// home
app.get('/', (req,res) => {
	var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		editing_permission = true
		console.log('user logged in')
	}
	res.render('home', {title:"Maths Partner", editing_permission, page:'home'})
	// res.redirect('/gk/null')
})

// login
app.get('/login', (req,res) => {
	// console.log(req.query.url)
	res.render('login', {title:"login", none:"none", heading:"LOGIN", current_url:req.query.url})
})

// logout
app.get('/logout', (req,res) => {
	if (req.session.logged_in != null){
		req.session.logged_in = false
		// if (req.session.permission == 'mathspartner') res.redirect('/gk/null')
		// else if (req.session.permission == 'gk') res.redirect('/gk/null')
		res.redirect(req.query.url)
	}
	else res.redirect('/')
})

// login verification
app.post('/user_authentication', (req,res) => {
	console.log(req.body)
	new_con.query("SELECT * FROM login where username = ?",[req.body.username] , function (err, result, fields) {
		if (err){
			console.log(err)
			res.json('failed')
			return
		}
		// if no such user exits
		if(result.length == 0){
			res.json('failed')
			console.log('no such user exits')
			return
		}
		if (result[0].password == req.body.password && result[0].permission == req.body.permission){
			req.session.logged_in = true
			req.session.permission = result[0].permission
			res.json("success")
		}
		else{
			res.json("failed")
		}
	});
})

// register_class payment
app.post('/register_class', (req,res) =>{
	console.log(req.body)
	if (req.body.email.includes('@') == false || req.body.email.includes('.com') == false){
		res.json('invalid email id')
		return
	}
	res.json('success')
})

// register
app.get('/register/:class_name', (req,res) =>{
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

// gk
app.get('/gk/:parent', (req,res) =>{
	var parent = req.params.parent
	// console.log(req.session.logged_in)
	var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		editing_permission = true
		console.log('user logged in')
	}

	new_con.query("SELECT * FROM gk where parent = ?",[parent] , function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.send("<h1>something went wrong</h1>")
			return
		}
		console.log(result)
		// if returned empty list
		if (result.length == 0){
			if (editing_permission){
				var topics = []
				if (parent == 'null') {
					var heading = "TOPICS"
					res.render('gk', {title:"topics", nav_selected:"gk", heading:heading, topics:topics, main_parent:'true', editing_permission, row_type:[]})
				}
				else {
					var heading = parent
					res.render('gk', {title:"topics", nav_selected:"gk", heading:heading, topics:topics, editing_permission, row_type:[]})
				}
				return
			}
			else{
				res.render('error')
				return
			}
		}
		// if its the end of the link
		// then its a quiz
		if (result[0].child == 'null'){
			// res.send([parent,result[0].duration,result[0].on_off])
			var redirect_link = '/gkquiz/'+parent+'/normal'
			res.redirect(redirect_link)
			return
		}

		// if its the end it might also be an audio clip
		// pdf_path is also used for audio clips
		if (result[0].child == 'audio'){
			res.redirect('/audio/'+req.params.parent+'/'+result[0].pdf_path)
			return
		}

		// if its the end it might also be an audio clip
		// pdf_path is also used for audio clips
		if (result[0].child == 'youtube'){
			var id = result[0].pdf_path.split('/')[result[0].pdf_path.split('/').length-1]
			res.redirect('/youtube/'+req.params.parent+'/'+id)
			return
		}

		var topics = []
		var row_type = []
		for (var i=0; i<result.length; i++){
			row_type.push(result[i].type)
			if (row_type[i] == 'youtube') row_type[i] += '##'+result[i].pdf_path
			if (row_type[i] == 'online_class') row_type[i] += '##'+result[i].date
			topics.push(result[i].child)
		}

		// sorting the two lists according to topics
		//1) combine the arrays:
		var list = [];
		for (var j = 0; j < topics.length; j++) 
			list.push({'topic': topics[j], 'row_type': row_type[j]});

		//2) sort:
		list.sort(function(a, b) {
			return ((a.topic < b.topic) ? -1 : ((a.topic == b.topic) ? 0 : 1));
			//Sort could be modified to, for example, sort on the row_type 
			// if the topic is the same.
		});

		//3) separate them back out:
		for (var k = 0; k < list.length; k++) {
			topics[k] = list[k].topic;
			row_type[k] = list[k].row_type;
		}

		if (parent == 'null') {
			var heading = "TOPICS"
			res.render('gk', {title:"topics", nav_selected:"gk", heading:heading, topics:topics, main_parent:'true', editing_permission, row_type})
		}
		else {
			var heading = parent
			res.render('gk', {title:"topics", nav_selected:"gk", heading:heading, topics:topics, editing_permission, row_type})
		}
	});
})

// new_online_class_submit
app.post('/new_online_class', (req,res) => {
	console.log(req.body)
	new_con.query("INSERT INTO `gk` (`id`, `parent`, `child`, `type`, `date`) VALUES (NULL, ?, ?, ?, ?);", [req.body.parent, req.body.child, 'online_class', req.body.date+'##'+req.body.time], function(err, result, fields){
		if (err){
			console.log(err)
			return
		}
		res.json('success')
	})
})

// gkaddyoutube
app.post('/gkaddyoutube', (req,res) =>{
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

// gkaddaudio
app.post('/gkaddaudio', (req,res) =>{
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

// gk quiz
app.get('/gkquiz/:quiz/:mode', (req,res) =>{
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
			res.render('error')
			return
		}
		console.log('asd')
		var on_off = result[0].on_off
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

			res.render('quiz_box', {grouped_questions:grouped_questions, title:"quiz_box", nav_selected:"gk", heading:quiz, questions:questions, time:duration, pdf_path:pdf_path, mode:mode, on_off, editing_permission})
		});

	});
})

// gk_edit_quiz
app.post('/gk_edit_quiz', (req,res) =>{
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
app.post('/gk_add_quiz', (req,res) =>{
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
		new_con.query("INSERT INTO `gk` (`id`, `parent`, `child`, `on_off`, `duration`, `pdf_path`, `type`) VALUES (NULL, ?, ?, ?, ?, '', 'quiz');", [new_parent, new_child, on_off, req.body[0].duration*60], function (err, result, fields) {
			if (err) {
				console.log(err)
				res.json('failed')
				return
			}
			// console.log("ASdasdasdasdadasdasdasd")
			// adding quiz table
			var table_name = new_parent.toString()
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

// gk_add_new_topic
app.post('/gk_add_new_topic', (req,res) =>{
	if (req.session.logged_in == null || req.session.logged_in == false){
		console.log('unautherized request')
		res.json('not autherized')
		return
		// console.log("USER NOT LOGGED IN")
	}

	console.log(req.body)
	for (var i=0; i<req.body.length; i++){
		new_con.query("INSERT INTO `gk` (`id`, `parent`, `child`, `on_off`, `duration`, `pdf_path`) VALUES (NULL, ?, ?, '', '', '');", [req.body[i].parent, req.body[i].child], function(err, result, fields) {
			if (err){
				console.log(err)
				res.json('failed')
				return
			}
		});
		console.log(i)
		if (i == req.body.length-1) res.json('success')
	// res.json('success')
	}
})

// save_user_results
app.post('/save_user_results', (req,res) => {
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
app.post('/get_user_details', (req,res) =>{
	const date_chosen = req.body.date_chosen
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

// rank_page
app.get('/user_ranks', (req,res) =>{
	var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		editing_permission = true
		console.log('user logged in')
	}
	res.render('user_ranks',{title:"Rank", nav_selected:'user_ranks', editing_permission})
	
})

// audio
app.get('/audio/:parent/:id', (req,res) =>{
	var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		editing_permission = true
		console.log('user logged in')
	}
	console.log(req.params.parent)
	res.render('audio', {title:"audio", audio_name: req.params.parent,nav_selected:"gk", src:req.params.id, editing_permission})
})

// gkrenametopic
// eg 1 { parent: 'null', old_child: 'A', new_child: 'B' }
// eg 2 { parent: 'AA', old_child: 'INSIDE AA', new_child: 'INSIDE A' }
app.post('/gkrenametopic', async (req,res) =>{
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

	if (req.body.parent == 'null') var parent_child_combo = req.body.old_child
	else var parent_child_combo = req.body.parent+'-'+req.body.old_child
	// parent_child_combo = AA-INSIDE AA
	console.log(parent_child_combo)
	var index_to_be_replaced = parent_child_combo.split('-').length - 1

	// first find all the parents with exactly == req.body.old_child in the table
	// if req.body.parent == 'null'
	var result_ = []
	// then we find all the parents starting with parent_child_combo along with '-' symbol
	// so that sql doesn't return AA when looking for just A
	new_con.query("SELECT * FROM gk WHERE parent LIKE ? OR parent = ?", [parent_child_combo+'-%', parent_child_combo], function(err,result,fields){
		if (err){
			console.log(err)
			res.json('failed')
			return
		}
		// console.log(result)
		// saving results to results_
		for (var i=0; i<result.length; i++){
			result_.push(result[i])
		}
		// looking for quiz tables (ie rows having child null)
		// var tables_to_be_renamed = []
		for (var i=0; i<result_.length; i++){
			// tables_to_be_renamed.push(result_[i].parent)
			// renaming row entries
			var old_name = result_[i].parent
			var new_name = result_[i].parent.split('-')
			new_name[index_to_be_replaced] = req.body.new_child
			new_name = new_name.join('-')
			console.log(old_name+' --> '+new_name)
			new_con.query("UPDATE gk SET parent = ? WHERE parent = ?", [new_name, old_name], function (err,result,field){
				if (err) {
					console.log(err)
					res.json('failed')
					return
				}
			})
			// renaming quiz tables
			if (result_[i].child == 'null'){
				// console.log(old_name+' --> '+new_name)
				new_con.query("ALTER TABLE ?? RENAME TO ??", [old_name, new_name], function(err,result,fields){
					if (err){
						console.log(err)
						res.json('failed')
						return
					}
				})
			}
		}
		// after all that rename the child
		new_con.query("UPDATE gk SET child = ? WHERE parent = ? AND child = ?", [req.body.new_child, req.body.parent, req.body.old_child], function (err,result,fields){
			if (err){
				console.log(err)
				res.json('failed')
				return
			}
			res.json('success')
		})
	});
})

// gkdeletetopic
app.post('/gkdeletetopic', (req,res) =>{
	console.log(req.body)
	// res.json('success')
	// return

	// var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		// editing_permission = true
		console.log('user logged in')
	}
	else{
		console.log('user not autherized')
		res.json('user not autherized')
		return
	}

	new_con.query("DELETE FROM gk WHERE parent = ? AND child = ?", [req.body.parent, req.body.child], function (err,result,fields) {
		if (err) {
			console.log(err)
			res.json('failed')
			return
		}
		// after deleting a single row delete everything under it
		if (req.body.parent == 'null') var parent = req.body.child
		else var parent = req.body.parent + '-' + req.body.child
		// console.log(parent)
		// before deleting every row entry, first find quizes under this topic
		// and delete all the quiz tables
		new_con.query("SELECT * FROM gk WHERE parent LIKE ? OR parent = ?", [parent+'-%', parent], function (err,result,field) {
			if (err){
				console.log(err)
				res.json('failed')
				return
			}
			// console.log(result)
			// return

			// delete all the quiz tables if any
			for (var i=0; i<result.length; i++){
				// console.log(result[i])

				// we only need quiz tables
				if (result[i].child != 'null') continue

				var pdf_path = result[i].pdf_path
				console.log(pdf_path)
				var pdf_path = './public'+pdf_path
				fs.unlink(pdf_path, (err) => {
					if (err) {
					console.error(err)
					return
					}
				
					console.log('file removed')
				})
				new_con.query("DROP TABLE ??", [result[i].parent], function (err,result,fields) {
					if (err){
						console.log(err)
						res.json('failed')
						return
					}

				})
			}

			new_con.query("DELETE FROM gk WHERE parent LIKE ? OR parent = ?", [parent+'-%', parent], function (err,result,field) {
				if (err){
					console.log(err)
					res.json('failed')
					return
				}
				res.json('success')
			})
		})
	});
})

// gkfileupload
app.post('/gkfileupload', (req,res) => {
	// console.log(req.files.inpFile)
	console.log('pdf received')
	var file = req.files.inpFile
	var name = file.name

	if (req.session.logged_in != null && req.session.logged_in == true){
		// editing_permission = true
		console.log('user logged in')
	}
	else{
		console.log('user not autherized')
		res.json('user not autherized')
		return
	}

	var file_path = './public/pdf_uploads/'+name+'.pdf'
	file.mv(file_path, (err)=>{
		if (err) {
			console.log(err)
			res.json('failed')
			return
		}
		file_path = '/pdf_uploads/'+name+'.pdf'
		new_con.query("UPDATE gk SET pdf_path = ? WHERE parent = ?", [file_path, name], function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.json('failed')
				return
			}
			res.send("success")
		});
	})
	// res.json('success')
})

// simple youtube
app.get('/youtube/:parent/:src', (req,res) =>{
	var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		editing_permission = true
		console.log('user logged in')
	}
	// editing_permission
	res.render('youtube',{title:"YouTube", nav_selected:"classes", heading:req.params.parent, link:req.params.src, editing_permission})
})

app.post('/github_update/the_secret_key', function(req, res) {
	console.log('update_received')
	// console.log(req.body)
	const ls = spawn("python3", ["update.py"]);
	
	ls.stdout.on("data", data => {
		console.log(`stdout: ${data}`);
	});
  
	ls.stderr.on("data", data => {
		console.log(`stderr: ${data}`);
	});
  
	ls.on('error', (error) => {
		console.log(`error: ${error.message}`);
	});
  
	ls.on("close", code => {
		console.log(`child process exited with code ${code}`);
	});
  
	res.json({'status':'updated'})
  
  });

// // dashboard
// app.get('/dashboard', (req,res) => {
// 	// first check whether the user has already logged in or not
// 	// console.log(req)
// 	if (req.session.logged_in == null || req.session.logged_in == false || req.session.permission != 'mathspartner'){
// 		res.render('login', {title:"login", none:"none", heading:"LOGIN"})
// 		return
// 		// console.log("USER NOT LOGGED IN")
// 	}

// 	new_con.query("SELECT DISTINCT topic_name FROM quiz", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.send("<h1>something went wrong</h1>")
// 			return
// 		}
// 		// console.log(result[0].topic_name);
// 		var topics = []
// 		for (var i=0; i<result.length; i++){
// 			topics.push(result[i].topic_name)
// 		}
// 		// get data for youtube
// 		new_con.query("SELECT DISTINCT topic_name FROM youtube", function (err, result) {
// 			if (err) {
// 				console.log(err)//throw err;
// 				res.send("<h1>something went wrong</h1>")
// 				return
// 			}
// 			// console.log("asdasdasdas")
// 			// console.log(result);
// 			var yt_topics = []
// 			for (var i=0; i<result.length; i++){
// 				yt_topics.push(result[i].topic_name)
// 			}
// 			res.render('dashboard', {title:"Dash Board", none:"none", heading:"Dash Board",topics_in_db:topics, yt_topics:yt_topics})
// 		});
// 	});
	
// })

// // {
// // 	changes_in_name: true,
// // 	old_topic_name: 'vishnu',
// // 	new_topic_name: 'ramesh',
// // 	changes_in_part: true,
// // 	old_part_number: '1',
// // 	new_part_number: '3',
// // 	changes_in_question_paper: true,
// // 	old_question_paper: 'question_paper_1',
// // 	new_question_paper: 'question_paper_6'
// //   }
// // change_names
// app.post('/change_names', async (req,res) => {

// 	var data = req.body
// 	console.log(data)
// 	// res.json("asd")
// 	// return
// 	if (data.changes_in_question_paper){
// 		console.log('changes in question paper required')
// 		await help.change_question_paper(data,new_con)
// 	}
// 	// return
// 	if (data.changes_in_part){
// 		console.log('changes in part number required')
// 		await help.change_part(data,new_con)
// 	}
// 	if (data.changes_in_name){
// 		console.log('changes in name required')
// 		await help.change_name(data,new_con)
// 	}
// 	// return
// 	res.json('success')
// })

// // yt_change_names
// app.post('/yt_change_names', async (req,res) => {

// 	var data = req.body
// 	console.log(data)
// 	// res.json("asd")
// 	// return
// 	if (data.changes_in_part){
// 		console.log('changes in part number required')
// 		try{
// 			new_con.query("UPDATE youtube SET part = '"+data.new_part_number+"' WHERE topic_name = '"+data.old_topic_name+"' AND part = '"+data.old_part_number+"'")
// 		}
// 		catch (err) {
// 			console.log(err);
// 			res.json('failed')
// 			return
// 		}
// 	}
// 	if (data.changes_in_name){
// 		console.log('changes in name required')
// 		try{
// 			new_con.query("UPDATE youtube SET topic_name = '"+data.new_topic_name+"' WHERE topic_name = '"+data.old_topic_name+"'")
// 		}
// 		catch (err) {
// 		console.log(err);
// 		res.json('failed')
// 		return
// 		}
// 	}
// 	// return
// 	res.json('success')
// })

// // fetch yt_parts_from_db/
// app.post('/yt_parts_from_db', (req,res) => {
// 	const data = req.body.yt_topic_name
// 	// console.log(data)
// 	new_con.query("SELECT part FROM youtube WHERE topic_name = '"+data+"'", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.json(null)
// 			return
// 		}
// 		console.log(result[0]);
// 		// spliting parts
// 		var parts = []
// 		// result = result[0].parts.split('#')
// 		for (var i=0; i<result.length; i++){
// 			// console.log(part)
// 			parts.push(result[i].part.split('_')[1])
// 		}
// 		res.json(parts)
// 	});
// })

// // yt_link_from_db
// app.post('/yt_link_from_db', (req,res) => {
// 	const topic_name = req.body.yt_topic_name
// 	const part = req.body.yt_part
// 	new_con.query("SELECT link FROM youtube WHERE topic_name = '"+topic_name+"' AND part = '"+'part_'+part+"'", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.json(null)
// 			return
// 		}
// 		console.log(result[0]);
// 		res.json(result[0].link)
// 	});
// })

// // yt_add_update
// app.post('/yt_add_update', (req,res) => {
// 	const yt_topic_name = req.body.yt_topic_name
// 	const yt_part_number_input = req.body.yt_part_number_input
// 	const yt_link_input = req.body.yt_link_input
// 	const yt_name_exists = req.body.yt_name_exists
// 	const yt_part_exists = req.body.yt_part_exists
	
// 	// if name and part exists then simply update the link
// 	if (yt_name_exists && yt_part_exists){
// 		new_con.query("UPDATE youtube SET link = '"+yt_link_input+"' WHERE topic_name = '"+yt_topic_name+"' AND part = '"+'part_'+yt_part_number_input+"'", function (err, result, fields) {
// 			if (err) {
// 				console.log(err)//throw err;
// 				res.json("failed")
// 				return
// 			}
// 			// console.log(result[0]);
// 			res.json("success")
// 		});
// 	}
// 	// else add new row
// 	else{
// 		new_con.query("INSERT INTO youtube VALUES(NULL, '"+yt_topic_name+"', '"+'part_'+yt_part_number_input+"', '"+yt_link_input+"')", function (err, result, fields) {
// 			if (err) {
// 				console.log(err)//throw err;
// 				res.json("failed")
// 				return
// 			}
// 			// console.log(result[0]);
// 			res.json("success")
// 		});
// 	}
// })

// // yt_delete
// app.post('/yt_delete', (req,res) => {
// 	// console.log(req.body)
// 	const yt_topic_name = req.body.yt_topic_name
// 	const yt_part_number_input = 'part_'+req.body.yt_part_number_input

// 	new_con.query("DELETE FROM youtube WHERE topic_name = '"+yt_topic_name+"' AND part = '"+yt_part_number_input+"'", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.json("failed")
// 			return
// 		}
// 		// console.log(result[0]);
// 		res.json("success")
// 	});
// })

// // fetch parts_from_db/
// app.post('/parts_from_db', (req,res) => {
// 	const data = req.body.selected_topic_name
// 	new_con.query("SELECT DISTINCT part FROM quiz WHERE topic_name = '"+data+"'", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.json(null)
// 			return
// 		}
// 		console.log(result[0]);
// 		// spliting parts
// 		var parts = []
// 		// result = result[0].parts.split('#')
// 		for (var i=0; i<result.length; i++){
// 			// console.log(part)
// 			parts.push(result[i].part.split('_')[1])
// 		}
// 		res.json(parts)
// 	});
// })

// // delete_topic
// app.post('/delete_topic', (req,res) => {
// 	const data = req.body
// 	console.log(data)
// 	res.json('success')
// })

// // delete_part_of_quiz
// app.post('/delete_part_of_quiz', (req,res) => {
// 	const data = req.body
// 	console.log(data)
// 	res.json('success')
// })

// // {
// // 	topic_name: 'RATIO',
// // 	question_paper: 'question_paper_1',
// // 	part_number: '1'
// //   }  
// // delete_the_whole_quiz
// app.post('/delete_the_whole_quiz', (req,res) => {
// 	const data = req.body
// 	// console.log(data)
// 	// res.json("success")
// 	// return
// 	new_con.query("DROP TABLE "+data.topic_name+'part_'+data.part_number+data.question_paper, function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.json('failed')
// 			return
// 		}
// 		// obtain pdf_path for deletion
// 		new_con.query("SELECT pdf_path FROM quiz WHERE topic_name = '"+data.topic_name+"' AND part = '"+'part_'+data.part_number+"' AND question_paper = '"+data.question_paper+"'", function (err, result, fields) {
// 			if (err) {
// 				console.log(err)//throw err;
// 				res.json('failed')
// 				return
// 			}
// 			// deleting the file async
// 			var pdf_path = './public'+result[0].pdf_path
// 			fs.unlink(pdf_path, (err) => {
// 				if (err) {
// 				  console.error(err)
// 				  return
// 				}
			  
// 				console.log('file removed')
// 			})
// 			new_con.query("DELETE FROM quiz WHERE topic_name = '"+data.topic_name+"' AND part = '"+'part_'+data.part_number+"' AND question_paper = '"+data.question_paper+"'", function (err, result, fields) {
// 				if (err) {
// 					console.log(err)//throw err;
// 					res.json('failed')
// 					return
// 				}
// 				res.json('success')
// 			});
// 		});
// 	});
// })
// // {
// // 	topic_name: 'RATIO',
// // 	part_number: 'part_1',
// // 	question_paper_for_duration: 'question_paper_1'
// //   }
// // get the complete quiz
// app.post('/get_quiz', (req,res) => {
// 	const data = req.body
// 	console.log(req.body)
// 	// res.json("asd")
// 	var table = data.topic_name+data.part_number+data.question_paper
// 	new_con.query("SELECT * FROM "+table, function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.json('failed')
// 			return
// 		}
// 		console.log(result);
// 		// return
// 		var data_to_send = result
// 		// res.json(result)
// 		// const table = req.body.quiz_name_for_duration
// 		// const question_paper = req.body.question_paper_for_duration
// 		new_con.query("SELECT duration,pdf_path,on_off FROM quiz WHERE question_paper = '"+data.question_paper+"' AND part = '"+data.part_number+"' AND topic_name = '"+data.topic_name+"'", function (err, result, fields) {
// 			if (err) {
// 				console.log(err)//throw err;
// 				res.json("failed")
// 				return
// 			}
// 			console.log(result);
// 			data_to_send[0]["duration"] = result[0].duration
// 			data_to_send[0]["pdf_path"] = result[0].pdf_path
// 			data_to_send[0]["on_off"] = result[0].on_off
// 			res.json(data_to_send)
// 		});
// 	});
// })

// // get_question_paper
// app.post('/get_question_paper/:mode', (req,res) => {
// 	const data = req.body
// 	console.log(data)

// 	var question_paper = data
// 	// var table = question_paper.topic_name+question_paper.part_number
// 	var available_question_papers = ['question_paper_1','question_paper_2','question_paper_3','question_paper_4','question_paper_5','question_paper_6']
// 	new_con.query("SELECT question_paper FROM quiz WHERE topic_name = '"+question_paper.topic_name+"' AND part = '"+question_paper.part_number+"'", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.json(null)
// 			return
// 		}
// 		console.log(result);
	
// 		var question_papers_in_db = []
// 		for (var i=0; i<result.length; i++){
// 			question_papers_in_db.push(result[i].question_paper)
// 		}
// 		console.log(req.params.mode)
		
// 		// if edit mode
// 		if (req.params.mode == 'edit') res.json(question_papers_in_db)
// 		// else if add mode
// 		else{
// 			// console.log("after sending")
// 			var permissible_question_papers = []
// 			for (var i=0; i<available_question_papers.length; i++){
// 				// console.log(question_papers_in_db.includes(available_question_papers[0]))
// 				// console.log(available_question_papers[0])
// 				if (question_papers_in_db.includes(available_question_papers[i])) continue
// 				else permissible_question_papers.push(available_question_papers[i])
// 			}
// 			if (permissible_question_papers.length == 0) permissible_question_papers = null
// 			// console.log('permissible_question_papers : '+permissible_question_papers)
// 			// console.log("should not reach here")
// 			res.json(permissible_question_papers)
// 		}
// 	});
// })

// app.post('/edit_quiz', (req,res) => {
// 	console.log(req.body)
// 	// if we are editing a quiz then remove the whole table
// 	// and add it again with new data.
// 	// Not a very good method but it works...don't judge :)
// 	var data = req.body
// 	// first update duration
// 	// var info_table = data[0].topic_name+"part_"+data[0].part_number
// 	new_con.query("UPDATE quiz SET duration = '"+parseInt(data[0].duration)*60+"' WHERE question_paper = '"+data[0].question_paper+"' AND part = '"+"part_"+data[0].part_number+"' AND topic_name = '"+data[0].topic_name+"'", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.json('failed')
// 			return
// 		}
// 		console.log(result);
// 		new_con.query("UPDATE quiz SET on_off = '"+data[0].on_off+"' WHERE question_paper = '"+data[0].question_paper+"' AND part = '"+"part_"+data[0].part_number+"' AND topic_name = '"+data[0].topic_name+"'", function (err, result, fields) {
// 			if (err) {
// 				console.log(err)//throw err;
// 				res.json('failed')
// 				return
// 			}
// 			console.log(result);
// 		});
// 	});
	
// 	// then delete the table
// 	var table_name = data[0].topic_name+"part_"+data[0].part_number+data[0].question_paper
// 	// console.log(table_name)
// 	new_con.query("DROP TABLE "+table_name, function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.json('failed')
// 			return
// 		}
// 		console.log(result);
	
// 		// after deleting recreate it with new values
// 		var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question VARCHAR(2555), option_1 VARCHAR(2555), option_2 VARCHAR(2555), option_3 VARCHAR(2555), option_4 VARCHAR(2555), correct VARCHAR(2555))";
// 		new_con.query(sql, function (err, result) {
// 			if (err) {
// 				console.log(err)//throw err;
// 				res.json('failed')
// 				return
// 			}
// 			console.log("Table created");
// 			// insert everything
// 			for (var i=0; i<data.length; i++){
// 				var sql = "INSERT INTO "+table_name+" VALUES ("+(i+1)+", '"+data[i].question+"', '"+data[i].options[0]+"', '"+data[i].options[1]+"', '"+data[i].options[2]+"', '"+data[i].options[3]+"', '"+data[i].correct+"')";
// 				new_con.query(sql, function (err, result) {
// 				if (err) {
// 					console.log(err)//throw err;
// 					res.json('failed')
// 					return
// 				}
// 				console.log("row " +(i+1)+" inserted");
// 				});
// 			}
// 		});
// 	});

// 	res.json("asd")
// })
// // [
// // 	{
// // 	  topic_name: 'asd',
// // 	  part_number: '2',
// // 	  question_paper: 'question_paper_1',
// // 	  question: 'asd',
// // 	  options: [ 'asd', 'asd', 'asd', 'asd' ],
// // 	  correct: 'asd',
// // 	  duration: '22',
// // 	  topic_name_exists: false,
// // 	  part_number_exists: false,
// // 	  pdf_path: '',
// // 	  on_off: false
// // 	}
// //   ]
// // add quiz to db
// app.post('/add_quiz', (req,res) => {
// 	const data = req.body
// 	console.log(data)
// 	// first thing to do is create an entry in the quiz table
// 	new_con.query("INSERT INTO quiz VALUES (NULL, '"+data[0].topic_name+"', '"+'part_'+data[0].part_number+"', '"+data[0].question_paper+"', '"+parseInt(data[0].duration)*60+"', '"+data[0].pdf_path+"', '"+data[0].on_off+"')", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.json('failed')
// 			return
// 		}
// 		// second is to create a table with questions, answers and correct choice
// 		var table_name = data[0].topic_name+'part_'+data[0].part_number+data[0].question_paper
// 		var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question VARCHAR(2555), option_1 VARCHAR(2555), option_2 VARCHAR(2555), option_3 VARCHAR(2555), option_4 VARCHAR(2555), correct VARCHAR(2555))";
// 		new_con.query(sql, function (err, result) {
// 			if (err) {
// 				console.log(err)//throw err;
// 				res.json('failed')
// 				return
// 			}
// 			console.log("Table created");
// 			// then add the questions
// 			for (var i=0; i<data.length; i++){
// 				var sql = "INSERT INTO "+table_name+" VALUES ("+(i+1)+", '"+data[i].question+"', '"+data[i].options[0]+"', '"+data[i].options[1]+"', '"+data[i].options[2]+"', '"+data[i].options[3]+"', '"+data[i].correct+"')";
// 				new_con.query(sql, function (err, result) {
// 				if (err) {
// 					console.log(err)//throw err;
// 					console.log("row " +(i+1)+" failed");
// 				}
// 				console.log("row " +(i+1)+" inserted");
// 				});
// 			}
// 			// return
// 			res.json("success")
// 		});
// 	});
// })

// // quiz box
// app.get('/quiz_box/:topic_name/:part_no/:question_paper/:mode', (req,res) => {

// 	const heading = req.params.topic_name + " " + req.params.part_no + " " + req.params.question_paper
// 	var dummy_questions = [
// 		{question:"question_1", options:['A','B','C','D'],correct:'D'},
// 		{question:"question_2", options:['A','B','C','D'],correct:'D'},
// 		{question:"question_3", options:['A','B','C','D'],correct:'D'},
// 		{question:"question_4", options:['A','B','C','D'],correct:'D'},
// 		{question:"question_5", options:['A','B','C','D'],correct:'D'},
// 	]

// 	// check whether the quiz is on or off
// 	new_con.query("SELECT on_off FROM quiz WHERE question_paper = '"+req.params.question_paper+"' AND part = '"+req.params.part_no+"' AND topic_name = '"+req.params.topic_name+"'", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.render('error')
// 			return
// 		}
// 		// if the quiz is off don't return the quiz
// 		if (result[0]==null) {
// 			res.render('error')
// 			return
// 		}
// 		if (result[0].on_off == 'false' && req.params.mode == 'normal'){
// 			// res.send("<h1>THIS QUIZ IS TEMPORARLY TURNED OFF. TRY AGAIN AFTER SOMETIME.")
// 			res.render('error')
// 			return
// 		}

// 		const table_name_for_duration = req.params.topic_name + req.params.part_no
// 		// console.log(table_name_for_duration)
// 		const table_name_for_questions = req.params.topic_name + req.params.part_no + req.params.question_paper
// 		// console.log(table_name_for_questions)
// 		let sql = "SELECT * FROM " + table_name_for_questions
// 		new_con.query(sql, function (err, result, fields) {
// 			if (err) {
// 				console.log(err)//throw err;
// 				res.render('error')
// 				return
// 			}
// 			// console.log(result);
// 			var questions = []
// 			for (var i=0; i<result.length; i++){
// 				var options = []
// 				options.push(result[i].option_1)
// 				options.push(result[i].option_2)
// 				options.push(result[i].option_3)
// 				options.push(result[i].option_4)
// 				questions.push({question:result[i].question, options:options,correct:result[i].correct})
// 			}
// 			// console.log(questions)
// 			help.shuffle(questions)
// 			for (var i=0; i<questions.length; i++) help.shuffle(questions[i].options)
	
// 			// fetching the time limit for the quiz
// 			let sql = "SELECT duration,pdf_path FROM quiz WHERE question_paper = '"+req.params.question_paper+"' AND part = '"+req.params.part_no+"'"
// 			new_con.query(sql, function (err, result, fields) {
// 				if (err) {
// 					console.log(err)//throw err;
// 					res.send("<h1>something went wrong</h1>")
// 					return
// 				}
// 				// console.log(result[0].duration);
// 				const time = result[0].duration
// 				const pdf_path = result[0].pdf_path

// 				// checking the mode
// 				if (req.params.mode == 'test') var mode = 'test'
// 				else var mode = 'normal'
	
// 				res.render('quiz_box', {title:"quiz_box", nav_selected:"quiz", heading:heading, questions:questions, time:time, pdf_path:pdf_path, mode:mode})
// 			});
// 		});

// 	});
// })

// // topics page
// app.get('/quiz', (req,res) => {
// 	var dummy_topics = ['ratio','calendar','speed&time','clock','profit & loss','number system'
// 						,'work & time','simple interest']

// 	new_con.query("SELECT DISTINCT topic_name FROM quiz", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.send("<h1>something went wrong</h1>")
// 			return
// 		}
// 		// console.log(result[0].topic_name);
// 		var topics = []
// 		for (var i=0; i<result.length; i++){
// 			topics.push(result[i].topic_name)
// 		}
// 		// console.log(topics)
// 		res.render('topics', {title:"topics", nav_selected:"quiz", heading:"TOPICS", topics:topics})
// 	});
// })

// // parts page
// app.get('/parts/:topic_name', (req,res) => {
// 	var dummy_parts = ['part-1','part-2','part-3']
// 	let name = req.params.topic_name
// 	let sql = "SELECT DISTINCT part FROM quiz WHERE topic_name = '"+name+"' "
// 	new_con.query(sql, function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.send("<h1>something went wrong</h1>")
// 			return
// 		}
// 		// console.log(result[0].parts);
// 		var topics = []
// 		for (var i=0; i<result.length; i++){
// 			topics.push(result[i].part)
// 		}
// 		res.render('topics', {title:"topics", nav_selected:"quiz", heading:req.params.topic_name, topics:topics, part:true})
// 	});
// })

// // question_paper page
// app.get('/question_paper/:topic_name/:part_no', (req,res) => {
	
// 	var dummy_question_papers = ['question_paper_1','question_paper_1','question_paper_1']

// 	const topic_name = req.params.topic_name
// 	const part_number = req.params.part_no
// 	const heading = topic_name+" "+req.params.part_no
// 	let sql = "SELECT question_paper FROM quiz WHERE topic_name = '"+topic_name+"' AND part = '"+part_number+"'"
// 	new_con.query(sql, function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.send("<h1>something went wrong</h1>")
// 			return
// 		}
// 		// console.log(result);
// 		var topics = []
// 		for (var i=0; i<result.length; i++){
// 			topics.push(result[i].question_paper)
// 		}

// 		res.render('topics', {title:"topics", nav_selected:"quiz", heading:heading, topics:topics, question_paper:true})
// 	});
// })

// // fileupload
// app.post('/fileupload', (req,res) => {
// 	var file = req.files.inpFile
// 	var name = file.name
// 	var topic_name = name.split('#')[0]
// 	var part_number = name.split('#')[1]
// 	var question_paper = name.split('#')[2]
	
// 	// console.log(req.files.inpFile)
// 	// return

// 	name = topic_name+part_number+question_paper
// 	// console.log(file)
// 	// saving the file
// 	var file_path = './public/pdf_uploads/'+name+'.pdf'
// 	file.mv(file_path, (err)=>{
// 		if (err) {
// 			console.log(err)
// 			res.json('failed')
// 			return
// 		}
// 		file_path = '/pdf_uploads/'+name+'.pdf'
// 		new_con.query("UPDATE quiz SET pdf_path = '"+file_path+"' WHERE topic_name = '"+topic_name+"' AND part = '"+part_number+"' AND question_paper = '"+question_paper+"'", function (err, result, fields) {
// 			if (err) {
// 				console.log(err)//throw err;
// 				res.json('failed')
// 				return
// 			}
// 			res.send("success")
// 		});
// 	})
// })

// // classes
// app.get('/classes', (req,res) => {
// 	var dummy_topics = ['ratio','calendar','speed&time','clock','profit & loss','number system'
// 	,'work & time','simple interest']

// 	new_con.query("SELECT DISTINCT topic_name FROM youtube ORDER BY topic_name", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.send("<h1>something went wrong</h1>")
// 			return
// 		}
// 		console.log(result);
// 		var topics = []
// 		for (var i=0; i<result.length; i++){
// 			topics.push(result[i].topic_name)
// 		}

// 		res.render('classes', {title:"topics", nav_selected:"classes", heading:"TOPICS", topics:topics})
// 	});

// });

// // /parts_yt/"+topic_id_.innerText
// app.get('/parts_yt/:topic_name', (req,res) => {
// 	const topic_name = req.params.topic_name
// 	new_con.query("SELECT part,link FROM youtube WHERE topic_name = '"+topic_name+"' ORDER BY part", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.send("<h1>something went wrong</h1>")
// 			return
// 		}
// 		console.log(result);
// 		var topics = []
// 		var links = []
// 		for (var i=0; i<result.length; i++){
// 			var part = result[i].part
// 			topics.push(part)

// 			var link_pos = result[i].link.split('/').length - 1
// 			var vid_id = result[i].link.split('/')[link_pos].split('?')
// 			links.push(vid_id[0])
// 		}

// 		res.render('classes', {title:"topics", nav_selected:"classes", heading:topic_name, topics:topics, parts:"true", links:links})
// 	});
// })

// // /youtube_videos/RATIO/part_1
// app.get('/youtube_videos/:topic_name/:part_number', (req,res) => {
// 	const topic_name = req.params.topic_name
// 	const part_number = req.params.part_number
// 	const heading = topic_name + ' ' +part_number
// 	// console.log(part_number)
// 	new_con.query("SELECT link FROM youtube WHERE topic_name = '"+topic_name+"' AND part = '"+part_number+"'", function (err, result, fields) {
// 		if (err) {
// 			console.log(err)//throw err;
// 			res.send("<h1>something went wrong</h1>")
// 			return
// 		}
// 		console.log(result);
// 		if (result.length == 0) {
// 			res.send("<h1>Video Doesn't exist</h1>")
// 			return
// 		}
// 		var src = result[0].link.split('/')[result[0].link.split('/').length-1]
// 		res.render('youtube',{title:"YouTube", nav_selected:"classes", heading:heading, link:src})
// 	});
// })

// about
app.get('/about', (req,res) => res.render('about', {title:"about", nav_selected:"about"}))

// ########################### HTML RENDERING ###########################################

// ########################### TEST ###########################################
// test
app.post('/testbody' ,(req,res) => {
	// res.send(req.body)
	res.json("hey hey")
})

// app.get('/', (req,res) => {
// 	res.send("<h1>hello world!!</h1>")
// })

var dic = {name:'vishnu',age:'21',year:'2020'}

// api tests
// get
app.get('/api', (req,res) => {
	res.json(dic)
})
// post with param in url
app.post('/api/', (req,res) => {
	console.log(req.body)
	res.json("asd")
})

// get an error with status 400
app.post('/apierror', (req,res) => {
	res.status(400).json({error:`boom an error. Hope you like it`})
})

// author info
app.get('/author', (req,res) => {
	res.json({'name':'vishnu',"github repo":'https://github.com/vishnu-vr/mathspartner'})
})

// amazon ec2 micro
app.get('/phpmyadmin_login', (req,res) => {
	res.redirect("http://18.221.233.238/phpmyadmin/")
})

// ######################################################################

const PORT = process.env.PORT || 5000

http.listen(PORT, () => console.log(`Server up on port ${PORT}`))



































