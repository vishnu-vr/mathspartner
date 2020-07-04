const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const shuffle = require('./helper_functions')

const app = express()

// middleware - logger
const logger = (req,res,next) => {
	console.log(`log : ${req.protocol}://${req.get('host')}${req.originalUrl}`)
	// console.log(JSON.stringify(req.body))
	next()
}

// initializing handlebar template engine
app.engine('handlebars', exphbs({defaultLayout: 'main',
						helpers: { json: (context) => JSON.stringify(context) }}
						));
app.set('view engine', 'handlebars');

// ############## MIDDLEWARES ###################
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
app.get('/quiz_box/:topic_name/:part_no', (req,res) => {

	const heading = req.params.topic_name + " " + req.params.part_no

	var dummy_questions = [
		{question:"question_1", options:['A','B','C','D'],correct:'D'},
		{question:"question_2", options:['A','B','C','D'],correct:'D'},
		{question:"question_3", options:['A','B','C','D'],correct:'D'},
		{question:"question_4", options:['A','B','C','D'],correct:'D'},
		{question:"question_5", options:['A','B','C','D'],correct:'D'},
	]
	shuffle(dummy_questions)
	for (var i=0; i<dummy_questions.length; i++) shuffle(dummy_questions[i].options)
	// console.log(dummy_questions)
	// console.log(dummy_questions)
	// dummy_questions = JSON.stringify(dummy_questions)
	res.render('quiz_box', {title:"quiz_box", nav_selected:"quiz", heading:heading, questions:dummy_questions})
})

// topics page
app.get('/quiz', (req,res) => {
	var dummy_topics = ['ratio','calendar','speed&time','clock','profit & loss','number system'
						,'work & time','simple interest']
	res.render('topics', {title:"topics", nav_selected:"quiz", heading:"TOPICS", topics:dummy_topics})
})

// parts page
app.get('/parts/:topic_name', (req,res) => {
	var dummy_parts = ['part-1','part-2','part-3']
	res.render('topics', {title:"topics", nav_selected:"quiz", heading:req.params.topic_name, topics:dummy_parts, part:true})
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



































