// var mysql = require('mysql2/promise');
var mysql = require('mysql2');
var fs = require('fs')

var new_con = mysql.createPool({
	host: "localhost",
	user: "root",
	password: "Telus2020!",
	database: "mathspartner"
  });


var loginCollection=[]
function BuildLoginCollection(){
	new_con.query("SELECT * FROM `login`", function(err,result_,fields){
	  if (err){
	    console.log(err)
	    return
	  }
	  // console.log(result_.length)
	  for (i = 0; i < result_.length; i++) {
	  	console.log(i)
	  	loginCollection.push({
	  		"username":result_[i].username,
	  		"password":result_[i].password,
	  		"permission":result_[i].permission
	  	})
	  }
	})
}



var user_detailsCollection=[]
function BuildUserDetailsCollection(){
	new_con.query("SELECT * FROM `user_details`", function(err,result_,fields){
	  if (err){
	    console.log(err)
	    return
	  }
	  // console.log(result_.length)
	  for (i = 0; i < result_.length; i++) {
	  	console.log(i)
	  	user_detailsCollection.push({
	  		"name":result_[i].name,
	  		"score":result_[i].score,
	  		"correct":result_[i].correct,
	  		"wrong":result_[i].wrong,
	  		"na":result_[i].na,
	  		"date":result_[i].date,
	  		"quiz_name":result_[i].quiz_name,
	  		"time_taken":result_[i].time_taken
	  	})
	  }
	})
}


var GKCollection=[]
function BuildGKCollection(){
	// var singleGK={}
	new_con.query("SELECT * FROM `gk`", function(err,result_,fields){
	  if (err){
	    console.log(err)
	    return
	  }
	  // console.log(result_.length)
	  for (i = 0; i < result_.length; i++) {
	  	console.log(i)
	  	GKCollection.push({
	  		"parent":result_[i].parent,
	  		"child":result_[i].child,
	  		"on_off":result_[i].on_off,
	  		"duration":result_[i].duration,
	  		"pdf_path":result_[i].pdf_path,
	  		"type":result_[i].type,
	  		"date":result_[i].date,
	  		"show_answers":result_[i].show_answers
	  	})
	  }
	})
}

// will return list of unique quiz names
function ConvertAllQuizToJSON(){
	new_con.query("SELECT parent FROM `gk` where type = 'quiz' and child = 'null'", function(err,result_,fields){
	  if (err){
	    console.log(err)
	    return
	  }
	  // console.log(result_.length)
	  for (i = 0; i < result_.length; i++) {
	  	quiz_name = result_[i].parent
	  	BuildQuizObject(quiz_name,i,result_.length)
	  }
	})
}
// // console.log(convertedTable)
// WriteJson("test.json",asd)

var convertedTable=[]
function BuildQuizObject(quiz_name,current_table_num,total_length){
	new_con.query("SELECT * FROM ??", [quiz_name], function(err,result,fields){
	  	if (err){
		    console.log(err)
			return
	  	}
		  // console.log(result)
	  	questions_and_answers_JsonList=[]
		for (var index = 0; index < result.length; index++) {
		  	questions_and_answers_JsonList.push({
				  	"question":result[index].question,
				  	"options":[result[index].option_1,result[index].option_2,result[index].option_3,result[index].option_4],
				  	"correct":result[index].correct,
				  	"section":result[index].section
			  	});
		}

	  	quiz_object={}
	  	quiz_object["name"]=quiz_name;
	  	quiz_object["questions_and_answers_list"] = questions_and_answers_JsonList
	  	convertedTable.push(quiz_object)
	  	// WriteJson("test.json",quiz_object)
	  	console.log(current_table_num)
	  	if (current_table_num+1 === total_length){
	  		console.log("finished")
	  		// console.log(convertedTable.slice(0,2))
	  	}
	})
}

function WriteJson(name,json){
	json = JSON.stringify(json);
	// console.log(json)
	fs.writeFile(name, json, function(err) {
	    if (err) {
	        console.log(err);
	    }
	});
}



setTimeout(()=>{
	console.log("finished");
	WriteJson("loginCollection.json",loginCollection);
},3000)









// create a new folder name "ARTICLES *"

// insert gk table entries where parent = "QUESTION PAPERS-ENGLISH-ARTICLES *" and child = "1"
// INSERT INTO gk (parent, child, type) VALUES ("QUESTION PAPERS-ENGLISH-ARTICLES *", "1", "quiz");

// rename "QUESTION PAPERS-ENGLISH-ARTICLES * 1" to "QUESTION PAPERS-ENGLISH-ARTICLES *-1"
// UPDATE gk SET parent = "QUESTION PAPERS-ENGLISH-ARTICLES *-1" WHERE parent = "QUESTION PAPERS-ENGLISH-ARTICLES * 1"

// rename the quiz table "QUESTION PAPERS-ENGLISH-ARTICLES * 1" to "QUESTION PAPERS-ENGLISH-ARTICLES *-1"
// ALTER TABLE `QUESTION PAPERS-ENGLISH-ARTICLES * 1` RENAME TO `QUESTION PAPERS-ENGLISH-ARTICLES *-1`;


// delete gk entry where parent = "QUESTION PAPERS-ENGLISH" and child = "ARTICLES * 1"
// DELETE FROM gk WHERE parent = "QUESTION PAPERS-ENGLISH" AND child = "ARTICLES * 1";




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