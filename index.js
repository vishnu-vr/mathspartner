const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const help = require('./helper_functions')
var creds = require('./creds')
const mysql = require('mysql2/promise');//require('mysql');
const { table, Console } = require('console')
const { json } = require('express')
const session = require('express-session')
const fileupload = require('express-fileupload')
const fs = require('fs');

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
	database: creds.database
});


// con.connect(function(err) {
// 	if (err) throw err;
// 	console.log("Database Connected!");
// });

const app = express()

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
app.use(session({secret:"sadsad123qdw12das",resave:false,saveUninitialized:true}))
// ############## MIDDLEWARES ###################

// ########################### HTML RENDERING ###########################################

// home
app.get('/', (req,res) => {
	// res.render('home', {title:"Maths Partner"})
	res.redirect('/quiz')
})

// login
app.get('/login', (req,res) => res.render('login', {title:"login", none:"none", heading:"LOGIN"}))

// logout
app.get('/logout', (req,res) => {
	req.session.logged_in = false
	res.redirect('/login')
})

// login verification
app.post('/user_authentication', (req,res) => {
	console.log(req.body)
	if (req.body.username == 'admin' && req.body.password == 'admin'){
		req.session.logged_in = true
		res.json("success")
	}
	else{
		res.json("failed")
	}
})

// dashboard
app.get('/dashboard', (req,res) => {
	// first check whether the user has already logged in or not
	// console.log(req)
	if (req.session.logged_in == null || req.session.logged_in == false){
		res.render('login', {title:"login", none:"none", heading:"LOGIN"})
		return
		// console.log("USER NOT LOGGED IN")
	}

	new_con.query("SELECT DISTINCT topic_name FROM quiz", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
			return
		}
		// console.log(result[0].topic_name);
		var topics = []
		for (var i=0; i<result.length; i++){
			topics.push(result[i].topic_name)
		}
		// get data for youtube
		new_con.query("SELECT DISTINCT topic_name FROM youtube", function (err, result) {
			if (err) {
				console.log(err)//throw err;
				res.render("<h1>something went wrong</h1>")
				return
			}
			// console.log("asdasdasdas")
			// console.log(result);
			var yt_topics = []
			for (var i=0; i<result.length; i++){
				yt_topics.push(result[i].topic_name)
			}
			res.render('dashboard', {title:"Dash Board", none:"none", heading:"Dash Board",topics_in_db:topics, yt_topics:yt_topics})
		});
	});
	
})

// {
// 	changes_in_name: true,
// 	old_topic_name: 'vishnu',
// 	new_topic_name: 'ramesh',
// 	changes_in_part: true,
// 	old_part_number: '1',
// 	new_part_number: '3',
// 	changes_in_question_paper: true,
// 	old_question_paper: 'question_paper_1',
// 	new_question_paper: 'question_paper_6'
//   }
// change_names
app.post('/change_names', async (req,res) => {

	var data = req.body
	console.log(data)
	// res.json("asd")
	// return
	if (data.changes_in_question_paper){
		console.log('changes in question paper required')
		await help.change_question_paper(data,new_con)
	}
	// return
	if (data.changes_in_part){
		console.log('changes in part number required')
		await help.change_part(data,new_con)
	}
	if (data.changes_in_name){
		console.log('changes in name required')
		await help.change_name(data,new_con)
	}
	// return
	res.json('success')
})

// yt_change_names
app.post('/yt_change_names', async (req,res) => {

	var data = req.body
	console.log(data)
	// res.json("asd")
	// return
	if (data.changes_in_part){
		console.log('changes in part number required')
		try{
			new_con.query("UPDATE youtube SET part = '"+data.new_part_number+"' WHERE topic_name = '"+data.old_topic_name+"' AND part = '"+data.old_part_number+"'")
		}
		catch (err) {
			console.log(err);
			res.json('failed')
			return
		}
	}
	if (data.changes_in_name){
		console.log('changes in name required')
		try{
			new_con.query("UPDATE youtube SET topic_name = '"+data.new_topic_name+"' WHERE topic_name = '"+data.old_topic_name+"'")
		}
		catch (err) {
		console.log(err);
		res.json('failed')
		return
		}
	}
	// return
	res.json('success')
})

// fetch yt_parts_from_db/
app.post('/yt_parts_from_db', (req,res) => {
	const data = req.body.yt_topic_name
	// console.log(data)
	new_con.query("SELECT part FROM youtube WHERE topic_name = '"+data+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json(null)
			return
		}
		console.log(result[0]);
		// spliting parts
		var parts = []
		// result = result[0].parts.split('#')
		for (var i=0; i<result.length; i++){
			// console.log(part)
			parts.push(result[i].part.split('_')[1])
		}
		res.json(parts)
	});
})

// yt_link_from_db
app.post('/yt_link_from_db', (req,res) => {
	const topic_name = req.body.yt_topic_name
	const part = req.body.yt_part
	new_con.query("SELECT link FROM youtube WHERE topic_name = '"+topic_name+"' AND part = '"+'part_'+part+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json(null)
			return
		}
		console.log(result[0]);
		res.json(result[0].link)
	});
})

// yt_add_update
app.post('/yt_add_update', (req,res) => {
	const yt_topic_name = req.body.yt_topic_name
	const yt_part_number_input = req.body.yt_part_number_input
	const yt_link_input = req.body.yt_link_input
	const yt_name_exists = req.body.yt_name_exists
	const yt_part_exists = req.body.yt_part_exists
	
	// if name and part exists then simply update the link
	if (yt_name_exists && yt_part_exists){
		new_con.query("UPDATE youtube SET link = '"+yt_link_input+"' WHERE topic_name = '"+yt_topic_name+"' AND part = '"+'part_'+yt_part_number_input+"'", function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.json("failed")
				return
			}
			// console.log(result[0]);
			res.json("success")
		});
	}
	// else add new row
	else{
		new_con.query("INSERT INTO youtube VALUES(NULL, '"+yt_topic_name+"', '"+'part_'+yt_part_number_input+"', '"+yt_link_input+"')", function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.json("failed")
				return
			}
			// console.log(result[0]);
			res.json("success")
		});
	}
})

// yt_delete
app.post('/yt_delete', (req,res) => {
	const yt_topic_name = req.body.yt_topic_name
	const yt_part_number_input = req.body.yt_part_number_input

	new_con.query("DELETE FROM youtube WHERE topic_name = '"+yt_topic_name+"' AND part = '"+yt_part_number_input+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json("failed")
			return
		}
		// console.log(result[0]);
		res.json("success")
	});
})

// fetch parts_from_db/
app.post('/parts_from_db', (req,res) => {
	const data = req.body.selected_topic_name
	new_con.query("SELECT DISTINCT part FROM quiz WHERE topic_name = '"+data+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json(null)
			return
		}
		console.log(result[0]);
		// spliting parts
		var parts = []
		// result = result[0].parts.split('#')
		for (var i=0; i<result.length; i++){
			// console.log(part)
			parts.push(result[i].part.split('_')[1])
		}
		res.json(parts)
	});
})

// delete_topic
app.post('/delete_topic', (req,res) => {
	const data = req.body
	console.log(data)
	res.json('success')
})

// delete_part_of_quiz
app.post('/delete_part_of_quiz', (req,res) => {
	const data = req.body
	console.log(data)
	res.json('success')
})

// {
// 	topic_name: 'RATIO',
// 	question_paper: 'question_paper_1',
// 	part_number: '1'
//   }  
// delete_the_whole_quiz
app.post('/delete_the_whole_quiz', (req,res) => {
	const data = req.body
	// console.log(data)
	// res.json("success")
	// return
	new_con.query("DROP TABLE "+data.topic_name+'part_'+data.part_number+data.question_paper, function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json('failed')
			return
		}
		// obtain pdf_path for deletion
		new_con.query("SELECT pdf_path FROM quiz WHERE topic_name = '"+data.topic_name+"' AND part = '"+'part_'+data.part_number+"' AND question_paper = '"+data.question_paper+"'", function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.json('failed')
				return
			}
			// deleting the file async
			var pdf_path = './public'+result[0].pdf_path
			fs.unlink(pdf_path, (err) => {
				if (err) {
				  console.error(err)
				  return
				}
			  
				console.log('file removed')
			})
			new_con.query("DELETE FROM quiz WHERE topic_name = '"+data.topic_name+"' AND part = '"+'part_'+data.part_number+"' AND question_paper = '"+data.question_paper+"'", function (err, result, fields) {
				if (err) {
					console.log(err)//throw err;
					res.json('failed')
					return
				}
				res.json('success')
			});
		});
	});
})
// {
// 	topic_name: 'RATIO',
// 	part_number: 'part_1',
// 	question_paper_for_duration: 'question_paper_1'
//   }
// get the complete quiz
app.post('/get_quiz', (req,res) => {
	const data = req.body
	console.log(req.body)
	// res.json("asd")
	var table = data.topic_name+data.part_number+data.question_paper
	new_con.query("SELECT * FROM "+table, function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json('failed')
			return
		}
		console.log(result);
		// return
		var data_to_send = result
		// res.json(result)
		// const table = req.body.quiz_name_for_duration
		// const question_paper = req.body.question_paper_for_duration
		new_con.query("SELECT duration,pdf_path,on_off FROM quiz WHERE question_paper = '"+data.question_paper+"' AND part = '"+data.part_number+"'", function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.json("failed")
				return
			}
			console.log(result);
			data_to_send[0]["duration"] = result[0].duration
			data_to_send[0]["pdf_path"] = result[0].pdf_path
			data_to_send[0]["on_off"] = result[0].on_off
			res.json(data_to_send)
		});
	});
})

// get_question_paper
app.post('/get_question_paper/:mode', (req,res) => {
	const data = req.body
	console.log(data)

	var question_paper = data
	// var table = question_paper.topic_name+question_paper.part_number
	var available_question_papers = ['question_paper_1','question_paper_2','question_paper_3','question_paper_4','question_paper_5','question_paper_6']
	new_con.query("SELECT question_paper FROM quiz WHERE topic_name = '"+question_paper.topic_name+"' AND part = '"+question_paper.part_number+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json(null)
			return
		}
		console.log(result);
	
		var question_papers_in_db = []
		for (var i=0; i<result.length; i++){
			question_papers_in_db.push(result[i].question_paper)
		}
		console.log(req.params.mode)
		
		// if edit mode
		if (req.params.mode == 'edit') res.json(question_papers_in_db)
		// else if add mode
		else{
			// console.log("after sending")
			var permissible_question_papers = []
			for (var i=0; i<available_question_papers.length; i++){
				// console.log(question_papers_in_db.includes(available_question_papers[0]))
				// console.log(available_question_papers[0])
				if (question_papers_in_db.includes(available_question_papers[i])) continue
				else permissible_question_papers.push(available_question_papers[i])
			}
			if (permissible_question_papers.length == 0) permissible_question_papers = null
			// console.log('permissible_question_papers : '+permissible_question_papers)
			// console.log("should not reach here")
			res.json(permissible_question_papers)
		}
	});
})

app.post('/edit_quiz', (req,res) => {
	console.log(req.body)
	// if we are editing a quiz then remove the whole table
	// and add it again with new data.
	// Not a very good method but it works...don't judge :)
	var data = req.body
	// first update duration
	// var info_table = data[0].topic_name+"part_"+data[0].part_number
	new_con.query("UPDATE quiz SET duration = '"+parseInt(data[0].duration)*60+"' WHERE question_paper = '"+data[0].question_paper+"' AND part = '"+"part_"+data[0].part_number+"' AND topic_name = '"+data[0].topic_name+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json('failed')
			return
		}
		console.log(result);
		new_con.query("UPDATE quiz SET on_off = '"+data[0].on_off+"' WHERE question_paper = '"+data[0].question_paper+"' AND part = '"+"part_"+data[0].part_number+"' AND topic_name = '"+data[0].topic_name+"'", function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.json('failed')
				return
			}
			console.log(result);
		});
	});
	
	// then delete the table
	var table_name = data[0].topic_name+"part_"+data[0].part_number+data[0].question_paper
	// console.log(table_name)
	new_con.query("DROP TABLE "+table_name, function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json('failed')
			return
		}
		console.log(result);
	
		// after deleting recreate it with new values
		var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question VARCHAR(255), option_1 VARCHAR(20), option_2 VARCHAR(20), option_3 VARCHAR(20), option_4 VARCHAR(20), correct VARCHAR(20))";
		new_con.query(sql, function (err, result) {
			if (err) {
				console.log(err)//throw err;
				res.json('failed')
				return
			}
			console.log("Table created");
			// insert everything
			for (var i=0; i<data.length; i++){
				var sql = "INSERT INTO "+table_name+" VALUES ("+(i+1)+", '"+data[i].question+"', '"+data[i].options[0]+"', '"+data[i].options[1]+"', '"+data[i].options[2]+"', '"+data[i].options[3]+"', '"+data[i].correct+"')";
				new_con.query(sql, function (err, result) {
				if (err) {
					console.log(err)//throw err;
					res.json('failed')
					return
				}
				console.log("row " +(i+1)+" inserted");
				});
			}
		});
	});

	res.json("asd")
})
// [
// 	{
// 	  topic_name: 'asd',
// 	  part_number: '2',
// 	  question_paper: 'question_paper_1',
// 	  question: 'asd',
// 	  options: [ 'asd', 'asd', 'asd', 'asd' ],
// 	  correct: 'asd',
// 	  duration: '22',
// 	  topic_name_exists: false,
// 	  part_number_exists: false,
// 	  pdf_path: '',
// 	  on_off: false
// 	}
//   ]
// add quiz to db
app.post('/add_quiz', (req,res) => {
	const data = req.body
	console.log(data)
	// first thing to do is create an entry in the quiz table
	new_con.query("INSERT INTO quiz VALUES (NULL, '"+data[0].topic_name+"', '"+'part_'+data[0].part_number+"', '"+data[0].question_paper+"', '"+parseInt(data[0].duration)*60+"', '"+data[0].pdf_path+"', '"+data[0].on_off+"')", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json('failed')
			return
		}
		// second is to create a table with questions, answers and correct choice
		var table_name = data[0].topic_name+'part_'+data[0].part_number+data[0].question_paper
		var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question VARCHAR(255), option_1 VARCHAR(20), option_2 VARCHAR(20), option_3 VARCHAR(20), option_4 VARCHAR(20), correct VARCHAR(20))";
		new_con.query(sql, function (err, result) {
			if (err) console.log("error")//throw err;
			console.log("Table created");
			// then add the questions
			for (var i=0; i<data.length; i++){
				var sql = "INSERT INTO "+table_name+" VALUES ("+(i+1)+", '"+data[i].question+"', '"+data[i].options[0]+"', '"+data[i].options[1]+"', '"+data[i].options[2]+"', '"+data[i].options[3]+"', '"+data[i].correct+"')";
				new_con.query(sql, function (err, result) {
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
})

// quiz box
app.get('/quiz_box/:topic_name/:part_no/:question_paper/:mode', (req,res) => {

	const heading = req.params.topic_name + " " + req.params.part_no + " " + req.params.question_paper
	var dummy_questions = [
		{question:"question_1", options:['A','B','C','D'],correct:'D'},
		{question:"question_2", options:['A','B','C','D'],correct:'D'},
		{question:"question_3", options:['A','B','C','D'],correct:'D'},
		{question:"question_4", options:['A','B','C','D'],correct:'D'},
		{question:"question_5", options:['A','B','C','D'],correct:'D'},
	]

	// check whether the quiz is on or off
	new_con.query("SELECT on_off FROM quiz WHERE question_paper = '"+req.params.question_paper+"' AND part = '"+req.params.part_no+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render('error')
			return
		}
		// if the quiz is off don't return the quiz
		if (result[0]==null) {
			res.render('error')
			return
		}
		if (result[0].on_off == 'false'){
			// res.send("<h1>THIS QUIZ IS TEMPORARLY TURNED OFF. TRY AGAIN AFTER SOMETIME.")
			res.render('error')
			return
		}

		const table_name_for_duration = req.params.topic_name + req.params.part_no
		// console.log(table_name_for_duration)
		const table_name_for_questions = req.params.topic_name + req.params.part_no + req.params.question_paper
		// console.log(table_name_for_questions)
		let sql = "SELECT * FROM " + table_name_for_questions
		new_con.query(sql, function (err, result, fields) {
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
				questions.push({question:result[i].question, options:options,correct:result[i].correct})
			}
			// console.log(questions)
			help.shuffle(questions)
			for (var i=0; i<questions.length; i++) help.shuffle(questions[i].options)
	
			// fetching the time limit for the quiz
			let sql = "SELECT duration,pdf_path FROM quiz WHERE question_paper = '"+req.params.question_paper+"' AND part = '"+req.params.part_no+"'"
			new_con.query(sql, function (err, result, fields) {
				if (err) {
					console.log(err)//throw err;
					res.render("<h1>something went wrong</h1>")
					return
				}
				// console.log(result[0].duration);
				const time = result[0].duration
				const pdf_path = result[0].pdf_path

				// checking the mode
				if (req.params.mode == 'test') var mode = 'test'
				else var mode = 'normal'
	
				res.render('quiz_box', {title:"quiz_box", nav_selected:"quiz", heading:heading, questions:questions, time:time, pdf_path:pdf_path, mode:mode})
			});
		});

	});
})

// save_user_results
app.post('/save_user_results', (req,res) => {
	console.log(req.body)
	const data = req.body
	new_con.query("INSERT INTO `user_details` (`id`, `name`, `score`, `correct`, `wrong`, `na`, `date`, `quiz_name`, `time_taken`) VALUES (NULL, '"+data.name+"', '"+parseFloat(data.score)+"', '"+data.correct+"', '"+data.wrong+"', '"+data.na+"', '"+data.date+"', '"+data.quiz_name+"', '"+data.time_taken+"')", function (err, result) {
		if (err) {
			console.log(err)
			res.json("failed")
			return
		}
		res.json("success")
	});
	
})

// get_user_details
app.post('/get_user_details', (req,res) =>{
	const date_chosen = req.body.date_chosen
	new_con.query("SELECT * FROM `user_details` WHERE `date` = '"+date_chosen+"' ORDER BY score DESC,time_taken ASC", function (err,result) {
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
	// new_con.query('SELECT * from user_details ORDER BY score DESC', function (err,result) {
	// 	if (err){
	// 		console.log(err)
	// 		res.json(null)
	// 		return
	// 	}
		
	// })
	res.render('user_ranks',{title:"Rank", nav_selected:'user_ranks'})
	
})

// topics page
app.get('/quiz', (req,res) => {
	var dummy_topics = ['ratio','calendar','speed&time','clock','profit & loss','number system'
						,'work & time','simple interest']

	new_con.query("SELECT DISTINCT topic_name FROM quiz", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
			return
		}
		// console.log(result[0].topic_name);
		var topics = []
		for (var i=0; i<result.length; i++){
			topics.push(result[i].topic_name)
		}
		// console.log(topics)
		res.render('topics', {title:"topics", nav_selected:"quiz", heading:"TOPICS", topics:topics})
	});
})

// parts page
app.get('/parts/:topic_name', (req,res) => {
	var dummy_parts = ['part-1','part-2','part-3']
	let name = req.params.topic_name
	let sql = "SELECT DISTINCT part FROM quiz WHERE topic_name = '"+name+"' "
	new_con.query(sql, function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
			return
		}
		// console.log(result[0].parts);
		var topics = []
		for (var i=0; i<result.length; i++){
			topics.push(result[i].part)
		}
		res.render('topics', {title:"topics", nav_selected:"quiz", heading:req.params.topic_name, topics:topics, part:true})
	});
})

// question_paper page
app.get('/question_paper/:topic_name/:part_no', (req,res) => {
	
	var dummy_question_papers = ['question_paper_1','question_paper_1','question_paper_1']

	const topic_name = req.params.topic_name
	const part_number = req.params.part_no
	const heading = topic_name+" "+req.params.part_no
	let sql = "SELECT question_paper FROM quiz WHERE topic_name = '"+topic_name+"' AND part = '"+part_number+"'"
	new_con.query(sql, function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
			return
		}
		// console.log(result);
		var topics = []
		for (var i=0; i<result.length; i++){
			topics.push(result[i].question_paper)
		}

		res.render('topics', {title:"topics", nav_selected:"quiz", heading:heading, topics:topics, question_paper:true})
	});
})

// fileupload
app.post('/fileupload', (req,res) => {
	var file = req.files.inpFile
	var name = file.name
	var topic_name = name.split('#')[0]
	var part_number = name.split('#')[1]
	var question_paper = name.split('#')[2]
	
	// console.log(req.files.inpFile)
	// return

	name = topic_name+part_number+question_paper
	// console.log(file)
	// saving the file
	var file_path = './public/pdf_uploads/'+name+'.pdf'
	file.mv(file_path, (err)=>{
		if (err) {
			console.log(err)
			res.json('failed')
			return
		}
		file_path = '/pdf_uploads/'+name+'.pdf'
		new_con.query("UPDATE quiz SET pdf_path = '"+file_path+"' WHERE topic_name = '"+topic_name+"' AND part = '"+part_number+"' AND question_paper = '"+question_paper+"'", function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.json('failed')
				return
			}
			res.send("success")
		});
	})
})

// classes
app.get('/classes', (req,res) => {
	var dummy_topics = ['ratio','calendar','speed&time','clock','profit & loss','number system'
	,'work & time','simple interest']

	new_con.query("SELECT DISTINCT topic_name FROM youtube ORDER BY topic_name", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
			return
		}
		console.log(result);
		var topics = []
		for (var i=0; i<result.length; i++){
			topics.push(result[i].topic_name)
		}

		res.render('classes', {title:"topics", nav_selected:"classes", heading:"TOPICS", topics:topics})
	});

});

// /parts_yt/"+topic_id_.innerText
app.get('/parts_yt/:topic_name', (req,res) => {
	const topic_name = req.params.topic_name
	new_con.query("SELECT part,link FROM youtube WHERE topic_name = '"+topic_name+"' ORDER BY part", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
			return
		}
		console.log(result);
		var topics = []
		var links = []
		for (var i=0; i<result.length; i++){
			var part = result[i].part
			topics.push(part)

			var link_pos = result[i].link.split('/').length - 1
			var vid_id = result[i].link.split('/')[link_pos].split('?')
			links.push(vid_id[0])
		}

		res.render('classes', {title:"topics", nav_selected:"classes", heading:topic_name, topics:topics, parts:"true", links:links})
	});
})

// /youtube_videos/RATIO/part_1
app.get('/youtube_videos/:topic_name/:part_number', (req,res) => {
	const topic_name = req.params.topic_name
	const part_number = req.params.part_number
	const heading = topic_name + ' ' +part_number
	// console.log(part_number)
	new_con.query("SELECT link FROM youtube WHERE topic_name = '"+topic_name+"' AND part = '"+part_number+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
			return
		}
		// console.log(result[0].link);

		res.render('youtube',{title:"YouTube", nav_selected:"classes", heading:heading, link:result[0].link})
	});
})

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

var dic = {name:'vishnu',age:'21'}

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


// ######################################################################

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server up on port ${PORT}`))



































