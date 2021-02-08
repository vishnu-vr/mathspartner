var express = require('express')
var router = express.Router()

// APIS FOR THE MOBILE APP
// will return list of unique quiz names
router.post('/get_list_of_quiz', (req,res)=>{
	new_con.query("SELECT DISTINCT `quiz_name` FROM `user_details`", function(err,result,fields){
		if (err){
		  console.log(err)
		  return
		}
		// console.table(result);
		res.json(result);
	  })
})

// will return user details rank wise
router.post('/user_details_from_quiz_name', (req,res) => {
	const quiz_name = req.body.quiz_name;
	new_con.query("SELECT * FROM `user_details` WHERE `quiz_name` = ? ORDER BY score DESC,time_taken ASC", [quiz_name], function(err,result,fields){
		if (err){
		  console.log(err)
		  return
		}
		// console.table(result);
		res.json(result);
	})
})

router.post('/delete_user_result', (req,res) => {
	const id = parseInt(req.body.row_id);
	console.log(id);
	new_con.query("DELETE FROM `user_details` WHERE `user_details`.`id` = ?", [id], function(err,result,fields){
		if (err){
		  console.log(err)
		  return
		}
		console.log(result);
		res.json("success");
	})
})

module.exports = router