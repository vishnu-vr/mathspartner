var mysql = require('mysql2/promise');

var new_con = mysql.createPool({
	host: "192.168.64.2",
	user: "vishnu",
	password: "2020",
	database: "mathspartner"
  });
  
// con.connect(function(err) {
// if (err) throw err;
// console.log("Database Connected!");
// });

async function querydb(){
	try{
		var result = await new_con.query("SELECT * FROM quiz")
		result = result[0]
		console.table(result)
	}
	catch(err){
		console.log(err)
	}
}

// querydb()


data = {
  changes_in_name: true,
  old_topic_name: 'vishnu1',
  new_topic_name: 'vishnu1',
  changes_in_part: false,
  changes_in_question_paper: false
}


async function change_part(data){
	// return
	try{
		var result = await new_con.query("SELECT question_paper FROM quiz WHERE topic_name = '"+data.old_topic_name+"' AND part = '"+data.old_part_number+"'")
	}
	catch (err) {
		console.log(err)//throw err;
		res.json('failed')
		return
	}

	var changes_required = []
	for (var i=0; i<result.length; i++){
		changes_required.push({old:data.old_topic_name+data.old_part_number+result[i].question_paper,new:data.old_topic_name+data.new_part_number+result[i].question_paper})
	}
	console.log(changes_required)
	// return
	try{
		await new_con.query("UPDATE quiz SET part = '"+data.new_part_number+"' WHERE topic_name = '"+data.old_topic_name+"' AND part = '"+data.old_part_number+"'")
	}
	catch (err) {
		console.log(err)//throw err;
		res.json('failed')
		return
	}
	for (var i=0; i<changes_required.length; i++){
		try{
			await new_con.query("ALTER TABLE "+changes_required[i].old+" RENAME TO "+changes_required[i].new)
		}
		catch (err) {
			console.log(err)//throw err;
			res.json('failed')
			return
		}
	}
}

// console.log("asd")
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











