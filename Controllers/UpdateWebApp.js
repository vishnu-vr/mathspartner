var express = require('express')
var router = express.Router()

const { spawn } = require("child_process")

router.post('/github_update/the_secret_key', function(req, res) {
	console.log('update_received')
	// console.log(req.body)
	const ls = spawn("python3", ["update.py"]);
	
	ls.stdout.on("data", data => {
		console.log(`stdout: ${data}`);
	});
  
	ls.stderr.on("data", data => {
		console.log(`stderr: ${data}`);
	});
  
	ls.on('error', (error) => {
		console.log(`error: ${error.message}`);
	});
  
	ls.on("close", code => {
		console.log(`child process exited with code ${code}`);
	});
  
	res.json({'status':'updated'})
});

module.exports = router