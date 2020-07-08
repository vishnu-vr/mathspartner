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

// delete_the_whole_quiz
app.post('/delete_the_whole_quiz', (req,res) => {
	const data = req.body
	console.log(data)
	res.json('success')
})

// get the complete quiz
app.post('/get_quiz', (req,res) => {
	const data = req.body.quiz_name
	console.log(data)
	// res.json("asd")
	// var table = 'RATIOpart_2question_paper_2'
	con.query("SELECT * FROM "+data, function (err, result, fields) {
		if (err) throw err;
		console.log(result);
		var data_to_send = result
		// res.json(result)
		const table = req.body.quiz_name_for_duration
		const question_paper = req.body.question_paper_for_duration
		con.query("SELECT duration FROM "+table+" WHERE question_paper = '"+question_paper+"'", function (err, result, fields) {
			if (err) throw err;
			console.log(result);
			data_to_send[0]["duration"] = result[0].duration
			res.json(data_to_send)
		});
	});
})

// get_question_paper
app.post('/get_question_paper/:mode', (req,res) => {
	const data = req.body
	console.log(data)

	var question_paper = data
	var table = question_paper.topic_name+question_paper.part_number
	var available_question_papers = ['question_paper_1','question_paper_2','question_paper_3']
	con.query("SELECT question_paper FROM " + table, function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json(null)
		}
		// console.log(result);
	
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

// add quiz to db
app.post('/add_quiz', (req,res) => {
	const data = req.body
	// console.log("packed received")
	// case - 1 : topic name and part number exists (ie we are adding a new question_paper)
	if (data[0].topic_name_exists && data[0].part_number_exists){
		// first thing to do is : update the quiz details table
		// with the new question_paper number and duration
		var table_name = data[0].topic_name+"part_"+data[0].part_number
		// console.log(table_name)
		con.query("INSERT INTO "+table_name+" (`id`, `question_paper`, `duration`) VALUES (NULL, '"+data[0].question_paper+"', '"+parseInt(data[0].duration)*60+"')", function (err, result, fields) {
			if (err) console.log("error")//throw err;
			console.log(result);
			// second is to create a table with questions
			table_name += data[0].question_paper
			var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question VARCHAR(255), option_1 VARCHAR(20), option_2 VARCHAR(20), option_3 VARCHAR(20), option_4 VARCHAR(20), correct VARCHAR(20))";
			con.query(sql, function (err, result) {
				if (err) console.log("error")//throw err;
				console.log("Table created");
				// then add the questions
				for (var i=0; i<data.length; i++){
					var sql = "INSERT INTO "+table_name+" VALUES ("+(i+1)+", '"+data[i].question+"', '"+data[i].options[0]+"', '"+data[i].options[1]+"', '"+data[i].options[2]+"', '"+data[i].options[3]+"', '"+data[i].correct+"')";
					con.query(sql, function (err, result) {
					if (err) throw err;
					console.log("row " +(i+1)+" inserted");
					});
				}
			});
		});
	}
	// case - 2 : topic name exists and part number doesn't exists (ie we are adding a 
	// new question_paper and a part-info table)
	else if (data[0].topic_name_exists && data[0].part_number_exists == false){
		// first thing to do is : update the index_table 
		// with the new part number
		// for that we initially fetch the parts
		// and append the new part with '#'
		var part_number = 'part_' + data[0].part_number
		con.query("SELECT parts FROM index_table WHERE topic_name = '"+data[0].topic_name+"'", function (err, result, fields) {
			if (err) throw err;
			var updated_parts = result[0].parts + "#" + part_number
			// console.log(updated_parts);
			con.query("UPDATE index_table SET parts = '"+updated_parts+"' WHERE topic_name = '"+data[0].topic_name+"'", function (err, result, fields) {
				if (err) throw err;
				// console.log(result)
				// after updating index table we have to
				// create an info-table of that part
				var table_name = data[0].topic_name + part_number
				// console.log(table_name)
				var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question_paper VARCHAR(20), duration VARCHAR(20))";
				con.query(sql, function (err, result) {
					if (err) throw err;
					console.log("Table created");
					// after creating the info-table, add the first entry
					// with id, question-paper and then duration
					var sql = "INSERT INTO "+table_name+" VALUES (1 ,'"+data[0].question_paper+"', '"+parseInt(data[0].duration)*60+"')";
					con.query(sql, function (err, result) {
						if (err) throw err;
						console.log("1 record inserted");
						// after all that, create the actual table containing
						// questions and insert the questions, options and
						// correct answer
						table_name += data[0].question_paper
						var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question VARCHAR(255), option_1 VARCHAR(20), option_2 VARCHAR(20), option_3 VARCHAR(20), option_4 VARCHAR(20), correct VARCHAR(20))";
						con.query(sql, function (err, result) {
							if (err) throw err;
							console.log("Table created");
							// insert everything
							for (var i=0; i<data.length; i++){
								var sql = "INSERT INTO "+table_name+" VALUES ("+(i+1)+", '"+data[i].question+"', '"+data[i].options[0]+"', '"+data[i].options[1]+"', '"+data[i].options[2]+"', '"+data[i].options[3]+"', '"+data[i].correct+"')";
								con.query(sql, function (err, result) {
								if (err) throw err;
								console.log("row " +(i+1)+" inserted");
								});
							}
						});
					});
				});
			});
		});
	
	}
	// case - 3 : topic name and part number doesn't exists (ie we are adding a totally new quiz)
	else if (data[0].topic_name_exists == false && data[0].part_number_exists == false){
		// first thing to do is : create a new row in index_table 
		// with topic name and part number
		var part_number = 'part_' + data[0].part_number
		con.query("INSERT INTO index_table VALUES (NULL, '"+data[0].topic_name+"', '"+part_number+"')", function (err, result, fields) {
			if (err) throw err;
			// console.log(result)
			// after creating a new row in index table we have to
			// create an info-table of that part
			var table_name = data[0].topic_name + part_number
			// console.log(table_name)
			var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question_paper VARCHAR(20), duration VARCHAR(20))";
			con.query(sql, function (err, result) {
				if (err) throw err;
				console.log("Table created");
				// after creating the info-table, add the first entry
				// with id, question-paper and then duration
				var sql = "INSERT INTO "+table_name+" VALUES (1 ,'"+data[0].question_paper+"', '"+data[0].duration+"')";
				con.query(sql, function (err, result) {
					if (err) throw err;
					console.log("1 record inserted");
					// after all that, create the actual table containing
					// questions and insert the questions, options and
					// correct answer
					table_name += data[0].question_paper
					var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question VARCHAR(255), option_1 VARCHAR(20), option_2 VARCHAR(20), option_3 VARCHAR(20), option_4 VARCHAR(20), correct VARCHAR(20))";
					con.query(sql, function (err, result) {
						if (err) throw err;
						console.log("Table created");
						// insert everythin
						for (var i=0; i<data.length; i++){
							var sql = "INSERT INTO "+table_name+" VALUES ("+(i+1)+", '"+data[i].question+"', '"+data[i].options[0]+"', '"+data[i].options[1]+"', '"+data[i].options[2]+"', '"+data[i].options[3]+"', '"+data[i].correct+"')";
							con.query(sql, function (err, result) {
							if (err) throw err;
							console.log("row " +(i+1)+" inserted");
							});
						}
					});
				});
			});
		});
	}

	res.json("add_quiz api called")
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

// question_paper page
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



































