// var mysql = require('mysql2/promise');
var mysql = require('mysql2');
// var fs = require('fs')

var new_con = mysql.createPool({
	host: "192.168.64.2",
	user: "vishnu",
	password: "2020",
	database: "mathspartner"
  });
  

// will delete a particular row
new_con.query("DELETE FROM `user_details` WHERE `user_details`.`id` = ?", [10], function(err,result,fields){
	if (err){
	  console.log(err)
	  return
	}
	console.log(result);
})

// SELECT * FROM gk WHERE parent LIKE 'QUESTION PAPERS-ENGLISH-PHOBIAS%';



// create a new folder name "PHOBIAS"

// insert gk table entries where parent = "QUESTION PAPERS-ENGLISH-PHOBIAS" and child = "1"
// INSERT INTO gk (parent, child, type) VALUES ("QUESTION PAPERS-ENGLISH-PHOBIAS", "1", "quiz");

// rename "QUESTION PAPERS-ENGLISH-PHOBIAS 1" to "QUESTION PAPERS-ENGLISH-PHOBIAS-1"
// UPDATE gk SET parent = "QUESTION PAPERS-ENGLISH-PHOBIAS-1" WHERE parent = "QUESTION PAPERS-ENGLISH-PHOBIAS 1"

// rename the quiz table "QUESTION PAPERS-ENGLISH-PHOBIAS 1" to "QUESTION PAPERS-ENGLISH-PHOBIAS-1"
// ALTER TABLE `QUESTION PAPERS-ENGLISH-PHOBIAS 1` RENAME TO `QUESTION PAPERS-ENGLISH-PHOBIAS-1`;


// delete gk entry where parent = "QUESTION PAPERS-ENGLISH" and child = "PHOBIAS 1"
// DELETE FROM gk WHERE parent = "QUESTION PAPERS-ENGLISH" AND child = "PHOBIAS 1";




// // will return list of unique quiz names
// new_con.query("SELECT DISTINCT `quiz_name` FROM `user_details`", function(err,result,fields){
//   if (err){
//     console.log(err)
//     return
//   }
//   console.table(result);
// })

// // will return user details rank wise
// new_con.query("SELECT * FROM `user_details` WHERE `quiz_name` = ? ORDER BY score DESC,time_taken ASC", ['MODEL QUESTION PAPERS-LDC-MODEL PAPER LDC (R)'], function(err,result,fields){
// 	if (err){
// 	  console.log(err)
// 	  return
// 	}
// 	console.table(result);
// })