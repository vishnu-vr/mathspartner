// var mysql = require('mysql2');
var creds = require('./creds')
const mysql = require('mysql2/promise');


async function connect() {
	try{
		var con = await mysql.createConnection({
			host: creds.host,
			user: creds.user,
			password: creds.password,
			database: "mathspartner"
		});
		// test = con
		// return con
		const result = await con.query(`select * from ??`,['index_table'])
		// console.table(result[0])
		return result[0]
	}
	catch(ex){
		console.error(ex)
	}
}

connect().then(data => {
	console.table(data)
	// console.log("here")
})

module.exports = connect()