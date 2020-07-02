const express = require('express')

const app = express()

// middleware - logger
const logger = (req,res,next) => {
	console.log(`log : ${req.protocol}://${req.get('host')}${req.originalUrl}`)
	next()
}

// initializing the logger middleware
app.use(logger)

app.get('/', (req,res) => {
	res.send("<h1>hello world!!</h1>")
})

var dic = {name:'vishnu',age:'21'}

// api tests
// get
app.get('/api', (req,res) => {
	res.json(dic)
})
// post with param in url
app.post('/api/:id', (req,res) => {
	res.json(req.params.id)
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server up on port ${PORT}`))



































