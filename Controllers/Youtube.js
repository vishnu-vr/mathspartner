var express = require('express')
var router = express.Router()

// simple youtube
router.get('/youtube/:parent/:src', (req,res) =>{
	var editing_permission = false
	if (AuthService.IsLoggedIn(req)){
		editing_permission = true;
	}
	// editing_permission
	res.render('youtube',{title:"YouTube", nav_selected:"classes", heading:req.params.parent, link:req.params.src, editing_permission})
})

// gkaddyoutube
// changed**
router.post('/gkaddyoutube', async (req,res) =>{
	console.log(req.body)
	if (!AuthService.IsLoggedIn(req)){
		console.log('unautherized request')
		res.json('not autherized')
		return
	}

	var splitted = req.body.link.trim().split(' ')
	splitted = splitted[3].split('"')
	var id = splitted[1]
	// checking whether the link contains '?' question mark
	// ie if the link is taken from a playlist
	id = id.split('?')
	id = id[0]

	// adding parent and child
	// generating topic model
	var topicModel = TopicService.GetTopicModel(
		req.body.parent,
		req.body.child,
		"",
		"",
		id,
		"youtube",
		"",
		"");

	// inserting topic
	await TopicService.AddTopic(topicModel);

	// adding parent+child and null (to indicate non folder item)
	if (req.body.parent == 'null')  var new_parent = req.body.child
	else var new_parent = req.body.parent + '-' + req.body.child
	var new_child = 'youtube'
			
	// generating topic model
	var topicModel = TopicService.GetTopicModel(
		new_parent,
		new_child,
		"",
		"",
		id,
		"youtube",
		"",
		"");

	// inserting topic
	await TopicService.AddTopic(topicModel);
	res.json('success')
})

module.exports = router