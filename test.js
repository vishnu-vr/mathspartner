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

// // inserting values to index_table

// var sql = "INSERT INTO index_table VALUES ('RATIO', 'part_1#part_2#part_3')";
// con.query(sql, function (err, result) {
// if (err) throw err;
// console.log("1 record inserted");
// });

// con.query("SELECT * FROM index_table", function (err, result, fields) {
// if (err) throw err;
// console.log(result);
// });

// // creating info-part table for different quiz

// var sql = "CREATE TABLE RATIOpart_3 (id INT AUTO_INCREMENT PRIMARY KEY, diff_level VARCHAR(1), duration VARCHAR(20))";
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










