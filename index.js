const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const help = require('./helper_functions');
var creds = require('./creds');
const session = require('express-session');
const fileupload = require('express-fileupload');
const fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

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

// Importing Serivces
var AuthService = require('./Services/Authentication');
global.AuthService = AuthService;
var TopicService = require('./Services/TopicService');
global.TopicService = TopicService;
var QuizService = require('./Services/QuizService');
global.QuizService = QuizService;
var UserResultService = require('./Services/UserResultService');
global.UserResultService = UserResultService;

// importing common
var DB = require('./Common/DB');
global.DB = DB;

var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) {
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// global declarations
global.help = help;
global.fs = fs;
global.io = io;

// initializing handlebar template engine
app.engine('handlebars', exphbs({defaultLayout: 'main',
						helpers: { json: (context) => JSON.stringify(context) }}
						));
app.set('view engine', 'handlebars');

// MIDDLEWARES
// logger
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

// using controllers
app.use(Answers);
app.use(Audio);
app.use(Auth);
app.use(Youtube);
app.use(Mobile);
app.use(Quiz);
app.use(OTA);
app.use(UserResults);
app.use(Topic);

const PORT = process.env.PORT || 5000

// initializing mongo client
const conString = creds.connectionString;
MongoClient.connect(conString, function(err, db) {
  if (err) throw err;
  console.log("MONGO CONNECTED")
  global.db = db;
  http.listen(PORT, () => console.log(`Server up on port ${PORT}`))
});

// const creds = { 
// 	host:'host.docker.internal', 
// 	user: 'root',
// 	password: 'password', 
// 	database: 'db_name', 
// 	secret: "secret",
// 	port: 3306
// }