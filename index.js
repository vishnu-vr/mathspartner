const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const help = require('./helper_functions');
var creds = require('./creds');
const mysql = require('mysql2');
const session = require('express-session');
const fileupload = require('express-fileupload');
const fs = require('fs');
// const { spawn } = require("child_process");

// Importing Controllers
var Topic = require('./Controllers/Topic');
var Quiz = require('./Controllers/Quiz');
var Auth = require('./Controllers/Authorization');
var Mobile = require('./Controllers/Mobile');
var Answers = require('./Controllers/Answers');
var Audio = require('./Controllers/Audio');
var Youtube = require('./Controllers/Youtube');
var UserResults = require('./Controllers/UserResults');
var OTA = require('./Controllers/UpdateWebApp');

var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};


const new_con = mysql.createPool({
	host: creds.host,
	user: creds.user,
	password: creds.password,
	database: creds.database,
	charset: "utf8_general_ci",
	port: creds.port
});

const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// global declarations
global.new_con = new_con;
global.help = help;
global.fs = fs;
global.io = io;

// initializing handlebar template engine
app.engine('handlebars', exphbs({defaultLayout: 'main',
						helpers: { json: (context) => JSON.stringify(context) }}
						));
app.set('view engine', 'handlebars');

// ############## MIDDLEWARES ###################
// middleware - logger
const logger = (req,res,next) => {
	console.log(`log : ${req.protocol}://${req.get('host')}${req.originalUrl}`)
	// console.log(JSON.stringify(req.body))
	next()
}

// fileupload
app.use(fileupload())

// public
app.use(express.static(path.join(__dirname, '/public')));
// initializing the logger middleware
app.use(logger)
// initializing body parser
app.use(express.json())
// for handling url encoded data. ie html forms
app.use(express.urlencoded({ extended:false }))
// for session
app.use(session({secret:creds.secret,resave:false,saveUninitialized:true}))
// ############## MIDDLEWARES ###################

// ########################### HTML RENDERING ###########################################

// home
app.get('/', (req,res) => {
	var editing_permission = false
	if (req.session.logged_in != null && req.session.logged_in == true){
		editing_permission = true
		console.log('user logged in')
	}
	res.render('home', {title:"Maths Partner", editing_permission, page:'home'})
	// res.redirect('/gk/null')
})

app.use(Answers);
app.use(Audio);
app.use(Auth);
app.use(Youtube);
app.use(Mobile);
app.use(Quiz);
app.use(OTA);
app.use(UserResults);
app.use(Topic);

// ########################### HTML RENDERING ###########################################

// get an error with status 400
app.post('/apierror', (req,res) => {
	res.status(400).json({error:`boom an error. Hope you like it`})
})

// author info
app.get('/author', (req,res) => {
	res.json({'name':'vishnu',"github repo":'https://github.com/vishnu-vr/mathspartner'})
})

// amazon ec2 micro
app.get('/phpmyadmin', (req,res) => {
	res.redirect("http://157.175.91.172/phpmyadmin/")
})

// ######################################################################

const PORT = process.env.PORT || 5000

http.listen(PORT, () => console.log(`Server up on port ${PORT}`))
