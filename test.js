// var mysql = require('mysql2/promise');
var mysql = require('mysql2');
var fs = require('fs')

var new_con = mysql.createPool({
	host: "192.168.64.2",
	user: "vishnu",
	password: "2020",
	database: "mathspartner"
  });
  
var parent_child_combo = 'science'
new_con.query("SELECT * FROM gk WHERE parent LIKE ? OR parent = ?", [parent_child_combo+'-%', parent_child_combo], function(err,result,fields){
  if (err){
    console.log(err)
    return
  }
  console.table(result)
})
