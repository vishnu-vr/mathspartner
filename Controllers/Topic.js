var express = require('express')
var router = express.Router()

// gk
router.get('/gk/:parent', async (req,res) => {
	var parent = req.params.parent
	const page = req.query.page || null
	const nav_selected = page || "gk"
	console.log(page)
	// console.log(req.session.logged_in)
	var editing_permission = false
	if (AuthService.IsLoggedIn(req)) editing_permission = true;

	var result=[]
	result = await TopicService.GetTopic(parent);
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

})

// gk_add_new_topic
// changed**
router.post('/gk_add_new_topic', async (req,res) =>{
	if (!AuthService.IsLoggedIn(req)){
		console.log('unautherized request')
		res.json('not autherized')
		return
	}
	console.log(req.body)
	for (var i=0; i<req.body.length; i++){
		var doc = TopicService.GetTopicModel(req.body[i].parent, req.body[i].child);
		await TopicService.AddTopic(doc);
		console.log(i)
	}
	res.json('success');
})

// gkrenametopic
// eg 1 { parent: 'null', old_child: 'A', new_child: 'B' }
// eg 2 { parent: 'AA', old_child: 'INSIDE AA', new_child: 'INSIDE A' }
router.put('/gkrenametopic', async (req,res) =>{
	console.log(req.body)
	
	if(!AuthService.IsLoggedIn(req)){
		console.log('user not autherized')
		res.json('user not autherized')
		return
	}

	if (req.body.parent == 'null') var parent_child_combo = req.body.old_child
	else var parent_child_combo = req.body.parent+'-'+req.body.old_child
	// parent_child_combo = AA-INSIDE AA
	console.log(parent_child_combo)
	var index_to_be_replaced = parent_child_combo.split('-').length - 1


	// find all parent names starting with parent_child_combo+'-' and exactly equal to parent_child_combo
	var result=[]
	var query = {$or: [{parent: {'$regex': '^'+parent_child_combo+'-.*'}}, {parent: parent_child_combo}]};
	result = await TopicService.GetTopicsViaQuery(query);

	// looking for quiz tables (ie rows having child null)
	for (var i=0; i<result.length; i++){
		// renaming row entries
		var old_name = result[i].parent
		var new_name = result[i].parent.split('-')
		new_name[index_to_be_replaced] = req.body.new_child
		new_name = new_name.join('-')
		console.log(old_name+' --> '+new_name)

		await TopicService.RenameTopicParent(old_name, new_name);
		// renaming quiz tables
		if (result[i].child == 'null') await QuizService.RenameQuizName(old_name, new_name);
	}

	// after all that rename the child
	await TopicService.RenameTopicChild(req.body.parent, req.body.old_child, req.body.new_child);

	res.json('success');
})

// gkdeletetopic
// changed**
router.delete('/gkdeletetopic', async (req,res) =>{
	console.log(req.body)

	// var editing_permission = false
	if (!AuthService.IsLoggedIn(req)){
		console.log('user not autherized')
		res.json('user not autherized')
		return
	}

	await TopicService.DeleteTopic(req.body.parent, req.body.child);

	// after deleting a single row delete everything under it
	if (req.body.parent == 'null') var parent = req.body.child
	else var parent = req.body.parent + '-' + req.body.child
	// console.log(parent)
	// before deleting every row entry, first find quizes under this topic
	// and delete all the quiz tables

	// find all parent names starting with parent+'-' and exactly equal to parent
	var result=[]
	var query = {$or: [{parent: {'$regex': '^'+parent+'-.*'}}, {parent: parent}]};
	result = await TopicService.GetTopicsViaQuery(query);

	// delete all the quiz tables if any
	for (var i=0; i<result.length; i++){
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

		await QuizService.DeleteQuiz(result[i].parent);
	}

	await TopicService.DeleteTopicsViaQuery(query);

	res.json('success');
})

// gkfileupload
// changed**
router.post('/gkfileupload', (req,res) => {
	// console.log(req.files.inpFile)
	console.log('pdf received')
	var file = req.files.inpFile
	var name = file.name

	if (!AuthService.IsLoggedIn(req)){
		console.log('user not autherized')
		res.json('user not autherized')
		return
	}

	var file_path = './public/pdf_uploads/'+name+'.pdf'
	file.mv(file_path, async (err)=>{
		if (err) {
			console.log(err)
			res.json('failed')
			return
		}
		file_path = '/pdf_uploads/'+name+'.pdf'

		await TopicService.UpdatePDFPath(file_path, name);
	})

	res.json('success');
})

module.exports = router