// var mysql = require('mysql2/promise');
var mysql = require('mysql2');
// var fs = require('fs')

var new_con = mysql.createPool({
	host: "192.168.64.2",
	user: "vishnu",
	password: "2020",
	database: "server"
  });
  
// // add section column
// new_con.query("show tables;", function(err,result,fields){
//   if (err){
//     console.log(err)
//     return
//   }
//   for (var i=0; i<result.length-3; i++){
//     // console.log(result[i])
//     new_con.query("ALTER TABLE ?? ADD `section` VARCHAR(2550) NOT NULL AFTER `correct`;", [result[i].Tables_in_server], function(err,result,fields){
//       if (err) throw err
//       // do something
//     })
//   }
// })

// // update math related quizes
// new_con.query("show tables;", function(err,result,fields){
//   if (err){
//     console.log(err)
//     return
//   }
//   // console.table(result)
//   for (var i=2; i<result.length-3; i++){
//     new_con.query("UPDATE ?? SET section = 'maths'", [result[i].Tables_in_server], function(err,result,fields){
//       if (err) throw err
//       // console.log(result[i].Tables_in_server)
//       // console.table(result)
//     })
//   }
// })

// // update gk related quizes
// new_con.query("show tables;", function(err,result,fields){
//   if (err){
//     console.log(err)
//     return
//   }
//   // console.table(result)
//   for (var i=0; i<2; i++){
//     new_con.query("UPDATE ?? SET section = 'gk'", [result[i].Tables_in_server], function(err,result,fields){
//       if (err) throw err
//       // console.log(result[i].Tables_in_server)
//       // console.table(result)
//     })
//   }
// })