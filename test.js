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


// var table = 'RATIOpart_1'
// var path = 'somepath'
// var question_paper = 'question_paper_1'
// var sql = "UPDATE "+table+" SET pdf_path = '"+path+"' WHERE question_paper = '"+question_paper+"'";
// con.query(sql, function (err, result) {
// 	if (err) throw err;
// 	console.log("1 record updated");
// });

var table_name_for_duration = 'RATIOpart_1'
var question_paper = 'question_paper_1'
let sql = "SELECT duration,pdf_path FROM " + table_name_for_duration + " WHERE question_paper = '"+question_paper+"' "
con.query(sql, function (err, result, fields) {
	if (err) {
		console.log(err)//throw err;
		res.render("<h1>something went wrong</h1>")
	}
	// console.log(result[0].duration);
	const time = result[0].duration
	const pdf_path = result[0].pdf_path
	console.log(pdf_path)
	// res.render('quiz_box', {title:"quiz_box", nav_selected:"quiz", heading:heading, questions:questions, time:time})
});


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











