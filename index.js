const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const shuffle = require('./helper_functions')
var creds = require('./creds')
const mysql = require('mysql');
const { table, Console } = require('console')
const { json } = require('express')
const session = require('express-session')
const fileupload = require('express-fileupload')
const fs = require('fs');

const con = mysql.createPool({
	host: creds.host,
	user: creds.user,
	password: creds.password,
	database: creds.database
});

const new_con = mysql.createPool({
	host: "192.168.64.2",
	user: "vishnu",
	password: "2020",
	database: "new_mathspartner"
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
app.get('/', (req,res) => res.render('home', {title:"Maths Partner"}))

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
		}
		// console.log(result[0].topic_name);
		var topics = []
		for (var i=0; i<result.length; i++){
			topics.push(result[i].topic_name)
		}
		// get data for youtube
		new_con.query("SELECT topic_name FROM youtube", function (err, result) {
			if (err) console.log(err)//throw err;
			// console.log("1 record updated");
			var yt_topics = []
			for (var i=0; i<result.length; i++){
				yt_topics.push(result[i].topic_name)
			}
			res.render('dashboard', {title:"Dash Board", none:"none", heading:"Dash Board",topics_in_db:topics, yt_topics:yt_topics})
		});
	});
	
})

// change_names
app.post('/change_names', (req,res) => {

	// const old_topic_name = req.body.old_topic_name
	// const new_topic_name = req.body.new_topic_name
	// const old_part_number = req.body.old_part_number
	// const new_part_number = req.body.new_part_number
	// const old_question_paper = req.body.old_question_paper
	// const new_question_paper = req.body.new_question_paper
	var data = req.body
	// console.log(data)
	// res.json("asd")

	if (data.old_question_paper){
		console.log('all changes are required')
		return
	}
	if (data.old_part_number){
		console.log('changes upto part number')
		return
	}
	if (data.old_topic_name){
		console.log('only name is required')
		// return
		var changes = []
		con.query("SELECT parts FROM index_table WHERE topic_name = '"+data.old_topic_name+"'", function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.json('failed')
				return
			}
			// console.log(result[0]);
			var parts = result[0].parts.split('#')
			for (var i=0; i<parts.length; i++){
				changes.push({'old':data.old_topic_name+parts[i],'new':data.new_topic_name+parts[i]})
			}

			// looping through old part tables
			for (var i=0; i<changes.length; i++){
				con.query("SELECT question_paper FROM "+changes[i].old, function (err, result, fields) {
					if (err) {
						console.log(err)//throw err;
						res.json('failed')
						return
					}
					// console.log(result[0]);
					// res.json("success")
					for (var j=0; j<result.length; j++){
						changes.push({'old':changes[i].old+result[0].question_paper,'new':changes[i].new+result[0].question_paper})
					}
				});
			}
			console.log("***************************")
			// after fetching all required details, start renaming
			for (var i=0; i<changes.length; i++){
				con.query("ALTER TABLE "+changes[0].old+" RENAME TO "+changes[0].new, function (err, result, fields) {
					if (err) {
						console.log(err)//throw err;
						res.json('failed')
						return
					}
					// console.log(result[0]);
					// res.json(result[0].link)
				});
			}

			res.json("success")
		});
	}
	// return
})

// fetch yt_parts_from_db/
app.post('/yt_parts_from_db', (req,res) => {
	const data = req.body.yt_topic_name
	con.query("SELECT part FROM youtube WHERE topic_name = '"+data+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json(null)
		}
		console.log(result[0]);
		// spliting parts
		var parts = []
		// result = result[0].parts.split('#')
		for (var i=0; i<result.length; i++){
			// console.log(part)
			parts.push(result[i].part)
		}
		res.json(parts)
	});
})

// yt_link_from_db
app.post('/yt_link_from_db', (req,res) => {
	const topic_name = req.body.yt_topic_name
	const part = req.body.yt_part
	con.query("SELECT link FROM youtube WHERE topic_name = '"+topic_name+"' AND part = '"+part+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.json(null)
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
		con.query("UPDATE youtube SET link = '"+yt_link_input+"' WHERE topic_name = '"+yt_topic_name+"' AND part = '"+yt_part_number_input+"'", function (err, result, fields) {
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
		con.query("INSERT INTO youtube VALUES(NULL, '"+yt_topic_name+"', '"+yt_part_number_input+"', '"+yt_link_input+"')", function (err, result, fields) {
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

	con.query("DELETE FROM youtube WHERE topic_name = '"+yt_topic_name+"' AND part = '"+yt_part_number_input+"'", function (err, result, fields) {
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
			parts.push(result[i].part.slice(-1))
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

	var quiz_table = data.topic_name+'part_'+data.part_number+data.question_paper
	// first delete the whole quiz table
	con.query("DROP TABLE "+quiz_table, function (err, result, fields) {
		if (err) console.log(err)//throw err;
		console.log(result);
		// then delete the question_paper entry from info-table
		var info_table = data.topic_name+'part_'+data.part_number
		con.query("DELETE FROM "+info_table+" WHERE question_paper = '"+data.question_paper+"' ", function (err, result, fields) {
			if (err) console.log(err)//throw err;
			console.log(result);
			// then check whether the info table is empty or not
			// if its not empty then stop there
			// else delete the table the info table and 
			// remove the part entry from index_table
			con.query("SELECT COUNT(*) FROM "+info_table, function (err, result, fields) {
				if (err) console.log(err)//throw err;
				console.log(result);
	
				if (result[0]['COUNT(*)'] == 0){
					con.query("DROP TABLE "+info_table, function (err, result, fields) {
						if (err) console.log(err)//throw err;
						console.log(result);
						// after that remove the part number from index_table
						con.query("SELECT parts FROM index_table WHERE topic_name = '"+data.topic_name+"'", function (err, result, fields) {
							if (err) console.log(err)//throw err;
							console.log(result);
	
							var parts = result[0].parts.split('#')
	
							var part_to_be_removed = 'part_'+data.part_number
							var updated_parts = []
							for (var i=0; i<parts.length; i++){
								if (parts[i] != part_to_be_removed) updated_parts.push(parts[i])
							}
							// if no part is remaining then remove that row (ie topic name)
							if (updated_parts.length == 0){
								con.query("DELETE FROM index_table WHERE topic_name = '"+data.topic_name+"'", function (err, result) {
								if (err) console.log(err)//throw err;
								console.log("1 record inserted");
								});
							}
							// else update the part
							else{
								updated_parts=updated_parts.join('#')
								con.query("UPDATE index_table SET parts = '"+updated_parts+"' WHERE topic_name = '"+data.topic_name+"'", function (err, result) {
								if (err) console.log(err)//throw err;
								console.log("1 record inserted");
								});
							}
						});
						
					});
				}
			});
		});
	});
	res.json('success')
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
		if (err) console.log(err)//throw err;
		console.log(result);
		// return
		var data_to_send = result
		// res.json(result)
		// const table = req.body.quiz_name_for_duration
		// const question_paper = req.body.question_paper_for_duration
		new_con.query("SELECT duration,pdf_path FROM quiz WHERE question_paper = '"+data.question_paper+"' AND part = '"+data.part_number+"'", function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.json("failed")
				return
			}
			console.log(result);
			data_to_send[0]["duration"] = result[0].duration
			data_to_send[0]["pdf_path"] = result[0].pdf_path
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
	// and rest will work fine (which is ofcourse adding it again)
	// not a very good method but it works...don't judge :)
	var data = req.body
	// first update duration
	var info_table = data[0].topic_name+"part_"+data[0].part_number
	con.query("UPDATE "+info_table+" SET duration = '"+parseInt(data[0].duration)*60+"' WHERE question_paper = '"+data[0].question_paper+"'", function (err, result, fields) {
		if (err) console.log(err)//throw err;
		console.log(result);
	});
	
	// then delete the table
	var table_name = data[0].topic_name+"part_"+data[0].part_number+data[0].question_paper
	// console.log(table_name)
	con.query("DROP TABLE "+table_name, function (err, result, fields) {
		if (err) console.log(err)//throw err;
		console.log(result);
	
		// after deleting recreate it with new values
		var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question VARCHAR(255), option_1 VARCHAR(20), option_2 VARCHAR(20), option_3 VARCHAR(20), option_4 VARCHAR(20), correct VARCHAR(20))";
		con.query(sql, function (err, result) {
			if (err) console.log(err)//throw err;
			console.log("Table created");
			// insert everything
			for (var i=0; i<data.length; i++){
				var sql = "INSERT INTO "+table_name+" VALUES ("+(i+1)+", '"+data[i].question+"', '"+data[i].options[0]+"', '"+data[i].options[1]+"', '"+data[i].options[2]+"', '"+data[i].options[3]+"', '"+data[i].correct+"')";
				con.query(sql, function (err, result) {
				if (err) console.log(err)//throw err;
				console.log("row " +(i+1)+" inserted");
				});
			}
		});
	});

	res.json("asd")
})

// add quiz to db
app.post('/add_quiz', (req,res) => {
	const data = req.body
	// console.log("packed received")
	// case - 1 : topic name and part number exists (ie we are adding a new question_paper)
	if (data[0].topic_name_exists && data[0].part_number_exists){
		// first thing to do is : update the quiz details table
		// with the new question_paper number, duration and pdf_path
		var table_name = data[0].topic_name+"part_"+data[0].part_number
		// console.log(table_name)
		con.query("INSERT INTO "+table_name+" (`id`, `question_paper`, `duration`, `pdf_path`) VALUES (NULL, '"+data[0].question_paper+"', '"+parseInt(data[0].duration)*60+"', '"+data[0].pdf_path+"')", function (err, result, fields) {
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
					if (err) console.log(err)//throw err;
					console.log("row " +(i+1)+" inserted");
					});
				}
				// return
				res.json("add_quiz api called")
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
			if (err) console.log(err)//throw err;
			var updated_parts = result[0].parts + "#" + part_number
			// console.log(updated_parts);
			con.query("UPDATE index_table SET parts = '"+updated_parts+"' WHERE topic_name = '"+data[0].topic_name+"'", function (err, result, fields) {
				if (err) console.log(err)//throw err;
				// console.log(result)
				// after updating index table we have to
				// create an info-table of that part
				var table_name = data[0].topic_name + part_number
				// console.log(table_name)
				var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question_paper VARCHAR(20), duration VARCHAR(20), pdf_path VARCHAR(255))";
				con.query(sql, function (err, result) {
					if (err) console.log(err)//throw err;
					console.log("Table created");
					// after creating the info-table, add the first entry
					// with id, question-paper and then duration
					var sql = "INSERT INTO "+table_name+" VALUES (1 ,'"+data[0].question_paper+"', '"+parseInt(data[0].duration)*60+"', '"+data[0].pdf_path+"')";
					con.query(sql, function (err, result) {
						if (err) console.log(err)//throw err;
						console.log("1 record inserted");
						// after all that, create the actual table containing
						// questions and insert the questions, options and
						// correct answer
						table_name += data[0].question_paper
						var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question VARCHAR(255), option_1 VARCHAR(20), option_2 VARCHAR(20), option_3 VARCHAR(20), option_4 VARCHAR(20), correct VARCHAR(20))";
						con.query(sql, function (err, result) {
							if (err) console.log(err)//throw err;
							console.log("Table created");
							// insert everything
							for (var i=0; i<data.length; i++){
								var sql = "INSERT INTO "+table_name+" VALUES ("+(i+1)+", '"+data[i].question+"', '"+data[i].options[0]+"', '"+data[i].options[1]+"', '"+data[i].options[2]+"', '"+data[i].options[3]+"', '"+data[i].correct+"')";
								con.query(sql, function (err, result) {
								if (err) console.log(err)//throw err;
								console.log("row " +(i+1)+" inserted");
								});
							}
							// return message
							res.json("add_quiz api called")
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
			if (err) console.log(err)//throw err;
			// console.log(result)
			// after creating a new row in index table we have to
			// create an info-table of that part
			var table_name = data[0].topic_name + part_number
			// console.log(table_name)
			var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question_paper VARCHAR(20), duration VARCHAR(20), pdf_path VARCHAR(255))";
			con.query(sql, function (err, result) {
				if (err) console.log(err)//throw err;
				console.log("Table created");
				// after creating the info-table, add the first entry
				// with id, question-paper, duration and pdf_path
				var sql = "INSERT INTO "+table_name+" VALUES (1 ,'"+data[0].question_paper+"', '"+parseInt(data[0].duration)*60+"', '"+data[0].pdf_path+"')";
				con.query(sql, function (err, result) {
					if (err) console.log(err)//throw err;
					console.log("1 record inserted");
					// after all that, create the actual table containing
					// questions and insert the questions, options and
					// correct answer
					table_name += data[0].question_paper
					var sql = "CREATE TABLE "+table_name+" (id INT AUTO_INCREMENT PRIMARY KEY, question VARCHAR(255), option_1 VARCHAR(20), option_2 VARCHAR(20), option_3 VARCHAR(20), option_4 VARCHAR(20), correct VARCHAR(20))";
					con.query(sql, function (err, result) {
						if (err) console.log(err)//throw err;
						console.log("Table created");
						// insert everything
						for (var i=0; i<data.length; i++){
							var sql = "INSERT INTO "+table_name+" VALUES ("+(i+1)+", '"+data[i].question+"', '"+data[i].options[0]+"', '"+data[i].options[1]+"', '"+data[i].options[2]+"', '"+data[i].options[3]+"', '"+data[i].correct+"')";
							con.query(sql, function (err, result) {
							if (err) console.log(err)//throw err;
							console.log("row " +(i+1)+" inserted");
							});
						}
						// return success
						res.json("add_quiz api called")
					});
				});
			});
		});
	}
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
	new_con.query(sql, function (err, result, fields) {
		if (err) console.log(err)//throw err;
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
		let sql = "SELECT duration,pdf_path FROM quiz WHERE question_paper = '"+req.params.question_paper+"' AND part = '"+req.params.part_no+"'"
		new_con.query(sql, function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.render("<h1>something went wrong</h1>")
			}
			// console.log(result[0].duration);
			const time = result[0].duration
			const pdf_path = result[0].pdf_path

			res.render('quiz_box', {title:"quiz_box", nav_selected:"quiz", heading:heading, questions:questions, time:time, pdf_path:pdf_path})
		});
	});
})

// topics page
app.get('/quiz', (req,res) => {
	var dummy_topics = ['ratio','calendar','speed&time','clock','profit & loss','number system'
						,'work & time','simple interest']

	new_con.query("SELECT DISTINCT topic_name FROM quiz", function (err, result, fields) {
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
	let sql = "SELECT DISTINCT part FROM quiz WHERE topic_name = '"+name+"' "
	new_con.query(sql, function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
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
	var table_name = name.split('#')[0]
	var question_paper = name.split('#')[1]

	name = table_name+question_paper
	// console.log(file)
	// saving the file
	var file_path = './public/pdf_uploads/'+name+'.pdf'
	file.mv(file_path, (err)=>{
		if (err) console.log(err)
		file_path = '/pdf_uploads/'+name+'.pdf'
		con.query("UPDATE "+table_name+" SET pdf_path = '"+file_path+"' WHERE question_paper = '"+question_paper+"'", function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
			}
		
		});
	})

	// updating the database with the new path

	res.send("success")
})

// classes
app.get('/classes', (req,res) => {
	var dummy_topics = ['ratio','calendar','speed&time','clock','profit & loss','number system'
	,'work & time','simple interest']

	new_con.query("SELECT topic_name FROM youtube", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
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
	con.query("SELECT part FROM youtube WHERE topic_name = '"+topic_name+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
		}
		console.log(result);
		var topics = []
		for (var i=0; i<result.length; i++){
			var part = 'part_' + result[i].part
			topics.push(part)
		}

		res.render('classes', {title:"topics", nav_selected:"classes", heading:topic_name, topics:topics, parts:"true"})
	});
})

// /youtube_videos/RATIO/part_1
app.get('/youtube_videos/:topic_name/:part_number', (req,res) => {
	const topic_name = req.params.topic_name
	const part_number = req.params.part_number.split('_')[1]
	const heading = topic_name + ' PART ' + part_number
	// console.log(part_number)
	con.query("SELECT link FROM youtube WHERE topic_name = '"+topic_name+"' AND part = '"+part_number+"'", function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.render("<h1>something went wrong</h1>")
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



































