const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const shuffle = require('./helper_functions')
var creds = require('./creds')
const mysql = require('mysql');
const { table } = require('console')
const { json } = require('express')

const con = mysql.createConnection({
	host: creds.host,
	user: creds.user,
	password: creds.password,
	database: creds.database
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Database Connected!");
});

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

// public
app.use(express.static(path.join(__dirname, '/public')));
// initializing the logger middleware
app.use(logger)
// initializing body parser
app.use(express.json())
// for handling url encoded data. ie html forms
app.use(express.urlencoded({ extended:false }))
// ############## MIDDLEWARES ###################

// ########################### HTML RENDERING ###########################################

// home
app.get('/', (req,res) => res.render('home', {title:"Maths Partner"}))

// login
app.get('/login', (req,res) => res.render('login', {title:"login", none:"none", heading:"LOGIN"}))

// dashboard
app.post('/dashboard', (req,res) => {
	con.query("SELECT topic_name FROM index_table", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
		}
		// console.log(result[0].topic_name);
		var topics = []
		for (var i=0; i<result.length; i++){
			topics.push(result[i].topic_name)
		}
		// console.log(topics)
		res.render('dashboard', {title:"Dash Board", none:"none", heading:"Dash Board",topics_in_db:topics})
	});
	
})

// fetch parts_from_db/
app.post('/parts_from_db', (req,res) => {
	const data = req.body.selected_topic_name
	con.query("SELECT parts FROM index_table WHERE topic_name = '"+data+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json(null)
		}
		console.log(result[0]);
		// spliting parts
		var parts = []
		result = result[0].parts.split('#')
		for (var i=0; i<result.length; i++){
			// console.log(part)
			parts.push(result[i].slice(-1))
		}
		res.json(parts)
	});
})

// get_diff_level
app.post('/get_diff_level', (req,res) => {
	const data = req.body
	console.log(data)

	var diff_level = data
	var table = diff_level.topic_name+diff_level.part_number
	var available_diff_levels = ['easy','medium','hard']
	con.query("SELECT diff_level FROM " + table, function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json(null)
		}
		// console.log(result);
	
		var diff_levels_in_db = []
		for (var i=0; i<result.length; i++){
			diff_levels_in_db.push(result[i].diff_level)
		}
		// console.log(diff_levels_in_db)
	
		var permissible_diff_levels = []
		for (var i=0; i<available_diff_levels.length; i++){
			// console.log(diff_levels_in_db.includes(available_diff_levels[0]))
			// console.log(available_diff_levels[0])
			if (diff_levels_in_db.includes(available_diff_levels[i])) continue
			else permissible_diff_levels.push(available_diff_levels[i])
		}
		if (permissible_diff_levels.length == 0) permissible_diff_levels = null
		// console.log('permissible_diff_levels : '+permissible_diff_levels)

		res.json(permissible_diff_levels)
	});
})

// add quiz to db
app.post('/add_quiz', (req,res) => {
	const data = req.body
	console.log(data)
	res.json("asd")
})

// quiz box
app.get('/quiz_box/:topic_name/:part_no/:question_paper', (req,res) => {

	const heading = req.params.topic_name + " " + req.params.part_no + " " + req.params.question_paper
	var dummy_questions = [
		{question:"question_1", options:['A','B','C','D'],correct:'D'},
		{question:"question_2", options:['A','B','C','D'],correct:'D'},
		{question:"question_3", options:['A','B','C','D'],correct:'D'},
		{question:"question_4", options:['A','B','C','D'],correct:'D'},
		{question:"question_5", options:['A','B','C','D'],correct:'D'},
	]

	const table_name_for_duration = req.params.topic_name + req.params.part_no
	// console.log(table_name_for_duration)
	const table_name_for_questions = req.params.topic_name + req.params.part_no + req.params.question_paper
	// console.log(table_name_for_questions)
	let sql = "SELECT * FROM " + table_name_for_questions
	con.query(sql, function (err, result, fields) {
		if (err) throw err;
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
		shuffle(questions)
		for (var i=0; i<questions.length; i++) shuffle(questions[i].options)

		// fetching the time limit for the quiz
		let sql = "SELECT duration FROM " + table_name_for_duration + " WHERE question_paper = '"+req.params.question_paper+"' "
		con.query(sql, function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.render("<h1>something went wrong</h1>")
			}
			// console.log(result[0].duration);
			const time = result[0].duration
			res.render('quiz_box', {title:"quiz_box", nav_selected:"quiz", heading:heading, questions:questions, time:time})
		});
	});
})

// topics page
app.get('/quiz', (req,res) => {
	var dummy_topics = ['ratio','calendar','speed&time','clock','profit & loss','number system'
						,'work & time','simple interest']

	con.query("SELECT topic_name FROM index_table", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
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
	let sql = "SELECT parts FROM index_table WHERE topic_name = '"+name+"' "
	con.query(sql, function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
		}
		// console.log(result[0].parts);
		var topics = result[0].parts.split('#')
		res.render('topics', {title:"topics", nav_selected:"quiz", heading:req.params.topic_name, topics:topics, part:true})
	});
})

// diff_level page
app.get('/question_paper/:topic_name/:part_no', (req,res) => {
	const heading = req.params.topic_name + " " + req.params.part_no
	var dummy_question_papers = ['question_paper_1','question_paper_1','question_paper_1']

	const table_name = req.params.topic_name+req.params.part_no
	let sql = "SELECT question_paper FROM " + table_name
	con.query(sql, function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
		}
		// console.log(result);
		var topics = []
		for (var i=0; i<result.length; i++){
			topics.push(result[i].question_paper)
		}

		res.render('topics', {title:"topics", nav_selected:"quiz", heading:heading, topics:topics, question_paper:true})
	});
})

// classes
app.get('/classes', (req,res) => res.render('classes', {title:"classes", nav_selected:"classes"}))

// about
app.get('/about', (req,res) => res.render('about', {title:"about", nav_selected:"about"}))

// ########################### HTML RENDERING ###########################################

// ########################### TEST ###########################################
// test
app.post('/testbody' ,(req,res) => {
	// res.send(req.body)
	res.json("hey hey")
})

app.get('/', (req,res) => {
	res.send("<h1>hello world!!</h1>")
})

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



































