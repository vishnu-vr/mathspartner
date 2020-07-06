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

var diff_level = { part_number: 'part_3', topic_name: 'RATIO' }
var table = diff_level.topic_name+diff_level.part_number
var available_diff_levels = ['easy','medium','hard']
con.query("SELECT diff_level FROM " + table, function (err, result, fields) {
	if (err) throw err;
	console.log(result);

	var diff_levels_in_db = []
	for (var i=0; i<result.length; i++){
		diff_levels_in_db.push(result[i].diff_level)
	}
	console.log(diff_levels_in_db)

	var permissible_diff_levels = []
	for (var i=0; i<available_diff_levels.length; i++){
		// console.log(diff_levels_in_db.includes(available_diff_levels[0]))
		// console.log(available_diff_levels[0])
		if (diff_levels_in_db.includes(available_diff_levels[i])) continue
		else permissible_diff_levels.push(available_diff_levels[i])
	}
	if (permissible_diff_levels.length == 0) permissible_diff_levels = null
	console.log('permissible_diff_levels : '+permissible_diff_levels)
	// res.render('dashboard', {title:"Dash Board", none:"none", heading:"Dash Board",topics_in_db:topics})
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











