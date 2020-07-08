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



data = {
  topic_name: 'sad',
  question_paper: 'question_paper_2',
  part_number: '2'
}

var quiz_table = data.topic_name+'part_'+data.part_number+data.question_paper

// first delete the whole quiz table
con.query("DROP TABLE "+quiz_table, function (err, result, fields) {
	if (err) throw err;
	console.log(result);
	// then delete the question_paper entry from info-table
	var info_table = data.topic_name+'part_'+data.part_number
	con.query("DELETE FROM "+info_table+" WHERE question_paper = '"+data.question_paper+"' ", function (err, result, fields) {
		if (err) throw err;
		console.log(result);
		// then check whether the info table is empty or not
		// if its not empty then stop there
		// else delete the table the info table and 
		// remove the part entry from index_table
		con.query("SELECT COUNT(*) FROM "+info_table, function (err, result, fields) {
			if (err) throw err;
			console.log(result);

			if (result[0]['COUNT(*)'] == 0){
				con.query("DROP TABLE "+info_table, function (err, result, fields) {
					if (err) throw err;
					console.log(result);
					// after that remove the part number from index_table
					con.query("SELECT parts FROM index_table WHERE topic_name = '"+data.topic_name+"'", function (err, result, fields) {
						if (err) throw err;
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
							if (err) throw err;
							console.log("1 record inserted");
							});
						}
						// else update the part
						else{
							updated_parts=updated_parts.join('#')
							con.query("UPDATE index_table SET parts = '"+updated_parts+"' WHERE topic_name = '"+data.topic_name+"'", function (err, result) {
							if (err) throw err;
							console.log("1 record inserted");
							});
						}
					});
					
				});
			}
		});
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











