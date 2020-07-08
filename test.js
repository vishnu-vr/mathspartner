var mysql = require('mysql');

var con = mysql.createConnection({
	host: "192.168.64.2",
	user: "vishnu",
	password: "2020",
	database: "mathspartner"
  });
  
con.connect(function(err) {
if (err) throw err;
console.log("Database Connected!");
});

data = [
  {
    topic_name: 'NEW_TOPIC',
    part_number: '4',
    question_paper: 'question_paper_1',
    question: 'asd',
    options: [ 'asd', 'asd', 'asd', 'asd' ],
    correct: 'asd',
    duration: '44',
    topic_name_exists: true,
    part_number_exists: true
  },
  {
    topic_name: 'NEW_TOPIC',
    part_number: '4',
    question_paper: 'question_paper_1',
    question: 'asd',
    options: [ 'asd', 'asd', 'asd', 'asd' ],
    correct: 'asd',
    duration: '44',
    topic_name_exists: true,
    part_number_exists: true
  }
]

// first update duration
// var info_table = data[0].topic_name+"part_"+data[0].part_number
// con.query("UPDATE "+info_table+" SET duration = '"+data[0].duration+"' WHERE question_paper = '"+data[0].question_paper+"'", function (err, result, fields) {
// 	if (err) throw err;
// 	console.log(result);
// });

// then delete the table
var table_name = 'vishnu'//data[0].topic_name+"part_"+data[0].part_number+data[0].question_paper
// console.log(table_name)
con.query("DROP TABLE "+table_name, function (err, result, fields) {
	if (err) throw err;
	console.log(result);

	// after deleting recreate it with new values
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


// // retreiving index table
// con.query("SELECT topic_name FROM index_table", function (err, result, fields) {
// 	if (err) throw err;
// 	// console.log(result[0].topic_name);
// 	var topics = []
// 	for (var i=0; i<result.length; i++){
// 		topics.push(result[i].topic_name)
// 	}
// 	// console.log(topics)
// 	res.render('topics', {title:"topics", nav_selected:"quiz", heading:"TOPICS", topics:topics})
// });

// // inserting values to index_table
// param = [
//   {
//     topic_name: 'RATIO',
//     part_number: '2',
//     diff_level: 'medium',
//     question: 'asd',
//     options: [ 'asd', 'asd', 'asd', 'asd' ],
//     correct: 'asd',
//     duration: '22',
//     topic_name_exists: true
//   }
// ]
// var sql = "INSERT INTO index_table VALUES ('RATIO', 'part_1#part_2#part_3')";
// con.query(sql, function (err, result) {
// if (err) throw err;
// console.log("1 record inserted");
// });

// let table_name_for_duration = 'RATIOpart_1'
// let diff_level = 'easy'
// let sql = "SELECT duration FROM " + table_name_for_duration + " WHERE diff_level = '"+diff_level+"' "
// con.query(sql, function (err, result, fields) {
// 	if (err) throw err;
// 	console.log(result[0].duration);
// });



// // creating info-part table for different quiz

// var sql = "CREATE TABLE RATIOpart_3 (id INT AUTO_INCREMENT PRIMARY KEY, diff_level VARCHAR(20), duration VARCHAR(20))";
// con.query(sql, function (err, result) {
// if (err) throw err;
// console.log("Table created");
// });

// // inserting value into info-part tables

// var sql = "INSERT INTO RATIOpart_3 VALUES (1 ,'e', '600')";
// con.query(sql, function (err, result) {
// if (err) throw err;
// console.log("1 record inserted");
// });

// var sql = "INSERT INTO RATIOpart_3 VALUES (2, 'm', '600')";
// con.query(sql, function (err, result) {
// if (err) throw err;
// console.log("1 record inserted");
// });

// var sql = "INSERT INTO RATIOpart_3 VALUES (3, 'h', '600')";
// con.query(sql, function (err, result) {
// if (err) throw err;
// console.log("1 record inserted");
// });

// con.query("SELECT * FROM RATIOpart_1", function (err, result, fields) {
// if (err) throw err;
// console.log(result);
// });

// // creating the quiz table

// var sql = "CREATE TABLE RATIOpart_3e (id INT AUTO_INCREMENT PRIMARY KEY, question VARCHAR(255), option_1 VARCHAR(20), option_2 VARCHAR(20), option_3 VARCHAR(20), option_4 VARCHAR(20), correct VARCHAR(20))";
// con.query(sql, function (err, result) {
// if (err) throw err;
// console.log("Table created");
// });

// // adding questions and options to the quiz table

// var sql = "INSERT INTO RATIOpart_3e VALUES (1, 'question_1', 'a', 'b', 'c', 'd', 'd')";
// con.query(sql, function (err, result) {
// if (err) throw err;
// console.log("1 record inserted");
// });

// var sql = "INSERT INTO RATIOpart_3e VALUES (2, 'question_2', 'a', 'b', 'c', 'd', 'd')";
// con.query(sql, function (err, result) {
// if (err) throw err;
// console.log("1 record inserted");
// });

// var sql = "INSERT INTO RATIOpart_3e VALUES (3, 'question_3', 'a', 'b', 'c', 'd', 'd')";
// con.query(sql, function (err, result) {
// if (err) throw err;
// console.log("1 record inserted");
// });

// var sql = "INSERT INTO RATIOpart_3e VALUES (4, 'question_4', 'a', 'b', 'c', 'd', 'd')";
// con.query(sql, function (err, result) {
// if (err) throw err;
// console.log("1 record inserted");
// });

// var sql = "INSERT INTO RATIOpart_3e VALUES (5, 'question_5', 'a', 'b', 'c', 'd', 'd')";
// con.query(sql, function (err, result) {
// if (err) throw err;
// console.log("1 record inserted");
// });











