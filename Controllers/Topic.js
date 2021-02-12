var express = require('express')
var router = express.Router()

// gk
router.get('/gk/:parent', (req,res) =>{
	var parent = req.params.parent
	const page = req.query.page || null
	const nav_selected = page || "gk"
	console.log(page)
	// console.log(req.session.logged_in)
	var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		editing_permission = true
		console.log('user logged in')
	}

	new_con.query("SELECT * FROM gk where parent = ?",[parent] , function (err, result, fields) {
		if (err) {
			console.log(err)//throw err;
			res.send("<h1>something went wrong</h1>")
			return
		}
		console.log(result)
		// if returned empty list
		if (result.length == 0){
			if (editing_permission){
				var topics = []
				if (parent == 'null') {
					var heading = "TOPICS"
					res.render('gk', {title:"topics", nav_selected:nav_selected, heading:heading, topics:topics, main_parent:'true', editing_permission, row_type:[], page})
				}
				else {
					var heading = parent
					res.render('gk', {title:"topics", nav_selected:nav_selected, heading:heading, topics:topics, editing_permission, row_type:[], page})
				}
				return
			}
			else{
				res.render('error')
				return
			}
		}
		// if its the end of the link
		// then its a quiz
		if (result[0].child == 'null'){
			// if this is null and page == "answers"
			// then redirect to answers page
			if (page && page == "answers"){
				res.redirect('/gkanswers/'+parent)
				return
			}

			// res.send([parent,result[0].duration,result[0].on_off])
			var redirect_link = '/gkquiz/'+parent+'/normal'
			res.redirect(redirect_link)
			return
		}

		// if its the end it might also be an audio clip
		// pdf_path is also used for audio clips
		if (result[0].child == 'audio'){
			res.redirect('/audio/'+req.params.parent+'/'+result[0].pdf_path)
			return
		}

		// if its the end it might also be an audio clip
		// pdf_path is also used for audio clips
		if (result[0].child == 'youtube'){
			var id = result[0].pdf_path.split('/')[result[0].pdf_path.split('/').length-1]
			res.redirect('/youtube/'+req.params.parent+'/'+id)
			return
		}

		var topics = []
		var row_type = []
		for (var i=0; i<result.length; i++){
			row_type.push(result[i].type)
			if (row_type[i] == 'youtube') row_type[i] += '##'+result[i].pdf_path
			if (row_type[i] == 'online_class') row_type[i] += '##'+result[i].date
			topics.push(result[i].child)
		}

		// sorting the two lists according to topics
		//1) combine the arrays:
		var list = [];
		for (var j = 0; j < topics.length; j++) 
			list.push({'topic': topics[j], 'row_type': row_type[j]});

		//2) sort:
		list.sort(function(a, b) {
			return ((a.topic < b.topic) ? -1 : ((a.topic == b.topic) ? 0 : 1));
			// Sort could be modified to, for example, sort on the row_type 
			// if the topic is the same.
		});

		//3) separate them back out:
		for (var k = 0; k < list.length; k++) {
			topics[k] = list[k].topic;
			row_type[k] = list[k].row_type;
		}

		if (parent == 'null') {
			var heading = "TOPICS"
			res.render('gk', {title:"topics", nav_selected:nav_selected, heading:heading, topics:topics, main_parent:'true', editing_permission, row_type, page})
		}
		else {
			var heading = parent
			res.render('gk', {title:"topics", nav_selected:nav_selected, heading:heading, topics:topics, editing_permission, row_type, page})
		}
	});
})

// gk_add_new_topic
// changed**
router.post('/gk_add_new_topic', (req,res) =>{
	if (req.session.logged_in == null || req.session.logged_in == false){
		console.log('unautherized request')
		res.json('not autherized')
		return
		// console.log("USER NOT LOGGED IN")
	}

	console.log(req.body)
	for (var i=0; i<req.body.length; i++){
		new_con.query("INSERT INTO `gk` (`id`, `parent`, `child`, `on_off`, `duration`, `pdf_path`) VALUES (NULL, ?, ?, '', '', '');", [req.body[i].parent, req.body[i].child], function(err, result, fields) {
			if (err){
				console.log(err)
				res.json('failed')
				return
			}
		});
		console.log(i)
		if (i == req.body.length-1) res.json('success')
	// res.json('success')
	}
})

// gkrenametopic
// eg 1 { parent: 'null', old_child: 'A', new_child: 'B' }
// eg 2 { parent: 'AA', old_child: 'INSIDE AA', new_child: 'INSIDE A' }
router.put('/gkrenametopic', async (req,res) =>{
	console.log(req.body)
	
	if (req.session.logged_in != null && req.session.logged_in == true){
		// editing_permission = true
		console.log('user logged in')
	}
	else{
		console.log('user not autherized')
		res.json('user not autherized')
		return
	}

	if (req.body.parent == 'null') var parent_child_combo = req.body.old_child
	else var parent_child_combo = req.body.parent+'-'+req.body.old_child
	// parent_child_combo = AA-INSIDE AA
	console.log(parent_child_combo)
	var index_to_be_replaced = parent_child_combo.split('-').length - 1

	// first find all the parents with exactly == req.body.old_child in the table
	// if req.body.parent == 'null'
	var result_ = []
	// then we find all the parents starting with parent_child_combo along with '-' symbol
	// so that sql doesn't return AA when looking for just A
	new_con.query("SELECT * FROM gk WHERE parent LIKE ? OR parent = ?", [parent_child_combo+'-%', parent_child_combo], function(err,result,fields){
		if (err){
			console.log(err)
			res.json('failed')
			return
		}
		// console.log(result)
		// saving results to results_
		for (var i=0; i<result.length; i++){
			result_.push(result[i])
		}
		// looking for quiz tables (ie rows having child null)
		// var tables_to_be_renamed = []
		for (var i=0; i<result_.length; i++){
			// tables_to_be_renamed.push(result_[i].parent)
			// renaming row entries
			var old_name = result_[i].parent
			var new_name = result_[i].parent.split('-')
			new_name[index_to_be_replaced] = req.body.new_child
			new_name = new_name.join('-')
			console.log(old_name+' --> '+new_name)
			new_con.query("UPDATE gk SET parent = ? WHERE parent = ?", [new_name, old_name], function (err,result,field){
				if (err) {
					console.log(err)
					res.json('failed')
					return
				}
			})
			// renaming quiz tables
			if (result_[i].child == 'null'){
				// console.log(old_name+' --> '+new_name)
				new_con.query("ALTER TABLE ?? RENAME TO ??", [old_name, new_name], function(err,result,fields){
					if (err){
						console.log(err)
						res.json('failed')
						return
					}
				})
			}
		}
		// after all that rename the child
		new_con.query("UPDATE gk SET child = ? WHERE parent = ? AND child = ?", [req.body.new_child, req.body.parent, req.body.old_child], function (err,result,fields){
			if (err){
				console.log(err)
				res.json('failed')
				return
			}
			res.json('success')
		})
	});
})

// gkdeletetopic
// changed**
router.delete('/gkdeletetopic', (req,res) =>{
	console.log(req.body)
	// res.json('success')
	// return

	// var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		// editing_permission = true
		console.log('user logged in')
	}
	else{
		console.log('user not autherized')
		res.json('user not autherized')
		return
	}

	new_con.query("DELETE FROM gk WHERE parent = ? AND child = ?", [req.body.parent, req.body.child], function (err,result,fields) {
		if (err) {
			console.log(err)
			res.json('failed')
			return
		}
		// after deleting a single row delete everything under it
		if (req.body.parent == 'null') var parent = req.body.child
		else var parent = req.body.parent + '-' + req.body.child
		// console.log(parent)
		// before deleting every row entry, first find quizes under this topic
		// and delete all the quiz tables
		new_con.query("SELECT * FROM gk WHERE parent LIKE ? OR parent = ?", [parent+'-%', parent], function (err,result,field) {
			if (err){
				console.log(err)
				res.json('failed')
				return
			}
			// console.log(result)
			// return

			// delete all the quiz tables if any
			for (var i=0; i<result.length; i++){
				// console.log(result[i])

				// we only need quiz tables
				if (result[i].child != 'null') continue

				var pdf_path = result[i].pdf_path
				console.log(pdf_path)
				var pdf_path = './public'+pdf_path
				fs.unlink(pdf_path, (err) => {
					if (err) {
					console.error(err)
					return
					}
				
					console.log('file removed')
				})
				new_con.query("DROP TABLE ??", [result[i].parent], function (err,result,fields) {
					if (err){
						console.log(err)
						res.json('failed')
						return
					}

				})
			}

			new_con.query("DELETE FROM gk WHERE parent LIKE ? OR parent = ?", [parent+'-%', parent], function (err,result,field) {
				if (err){
					console.log(err)
					res.json('failed')
					return
				}
				res.json('success')
			})
		})
	});
})

// gkfileupload
// changed**
router.post('/gkfileupload', (req,res) => {
	// console.log(req.files.inpFile)
	console.log('pdf received')
	var file = req.files.inpFile
	var name = file.name

	if (req.session.logged_in != null && req.session.logged_in == true){
		// editing_permission = true
		console.log('user logged in')
	}
	else{
		console.log('user not autherized')
		res.json('user not autherized')
		return
	}

	var file_path = './public/pdf_uploads/'+name+'.pdf'
	file.mv(file_path, (err)=>{
		if (err) {
			console.log(err)
			res.json('failed')
			return
		}
		file_path = '/pdf_uploads/'+name+'.pdf'
		new_con.query("UPDATE gk SET pdf_path = ? WHERE parent = ?", [file_path, name], function (err, result, fields) {
			if (err) {
				console.log(err)//throw err;
				res.json('failed')
				return
			}
			res.send("success")
		});
	})
	// res.json('success')
})

module.exports = router