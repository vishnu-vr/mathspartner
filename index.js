const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const shuffle = require('./helper_functions')
var creds = require('./creds')
const mysql = require('mysql');
const { table } = require('console')

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

// quiz box
app.get('/quiz_box/:topic_name/:part_no/:diff_level', (req,res) => {

	const heading = req.params.topic_name + " " + req.params.part_no + " " + req.params.diff_level
	var dummy_questions = [
		{question:"question_1", options:['A','B','C','D'],correct:'D'},
		{question:"question_2", options:['A','B','C','D'],correct:'D'},
		{question:"question_3", options:['A','B','C','D'],correct:'D'},
		{question:"question_4", options:['A','B','C','D'],correct:'D'},
		{question:"question_5", options:['A','B','C','D'],correct:'D'},
	]

	const table_name_for_duration = req.params.topic_name + req.params.part_no
	// console.log(table_name_for_duration)
	const table_name_for_questions = req.params.topic_name + req.params.part_no + req.params.diff_level
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
		let sql = "SELECT duration FROM " + table_name_for_duration + " WHERE diff_level = '"+req.params.diff_level+"' "
		con.query(sql, function (err, result, fields) {
			if (err) throw err;
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
		if (err) throw err;
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
		if (err) throw err;
		// console.log(result[0].parts);
		var topics = result[0].parts.split('#')
		res.render('topics', {title:"topics", nav_selected:"quiz", heading:req.params.topic_name, topics:topics, part:true})
	});
})

// diff_level page
app.get('/diff_level/:topic_name/:part_no', (req,res) => {
	const heading = req.params.topic_name + " " + req.params.part_no
	var dummy_diff_levels = ['easy','medium','hard']

	const table_name = req.params.topic_name+req.params.part_no
	let sql = "SELECT diff_level FROM " + table_name
	con.query(sql, function (err, result, fields) {
		if (err) throw err;
		// console.log(result);
		var topics = []
		for (var i=0; i<result.length; i++){
			topics.push(result[i].diff_level)
		}

		res.render('topics', {title:"topics", nav_selected:"quiz", heading:heading, topics:topics, diff_level:true})
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
app.post('/api/:id', (req,res) => {
	res.json(req.params.id)
})

// get an error with status 400
app.post('/apierror', (req,res) => {
	res.status(400).json({error:`boom an error. Hope you like it`})
})

// ######################################################################

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server up on port ${PORT}`))



































