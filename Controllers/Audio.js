var express = require('express');
const TopicService = require('../Services/TopicService');
var router = express.Router()

// audio
router.get('/audio/:parent/:id', (req,res) =>{
	var editing_permission = false
	if (AuthService.IsLoggedIn(req)){
		editing_permission = true;
	}
	console.log(req.params.parent)
	res.render('audio', {title:"audio", audio_name: req.params.parent,nav_selected:"gk", src:req.params.id, editing_permission})
})

// gkaddaudio
// changed**
router.post('/gkaddaudio', async (req,res) =>{
	console.log(req.body)
	if (!AuthService.IsLoggedIn(req)){
		console.log('unautherized request')
		res.json('not autherized')
		return
	}

	// adding parent and child
	// generating topic model
	var topicModel = TopicService.GetTopicModel(
		req.body.parent,
		req.body.child,
		"",
		"",
		"",
		"audio",
		"",
		"");

	// inserting topic
	await TopicService.AddTopic(topicModel);

	// adding parent+child and null (to indicate quiz)
	if (req.body.parent == 'null')  var new_parent = req.body.child
	else var new_parent = req.body.parent + '-' + req.body.child
	var new_child = 'audio'
	var id = req.body.link.split('/')[5]
	
	// generating topic model
	var topicModel = TopicService.GetTopicModel(
		new_parent,
		new_child,
		"",
		"",
		id,
		"audio",
		"",
		"");

	// inserting topic
	await TopicService.AddTopic(topicModel);
	res.json('success')
})

module.exports = router