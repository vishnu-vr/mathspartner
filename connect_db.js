// var mysql = require('mysql2');
var creds = require('./creds')
const mysql = require('mysql2/promise');

var conn = null
async function connect() {
	try{
		var con = await mysql.createConnection({
			host: creds.host,
			user: creds.user,
			password: creds.password,
			database: "mathspartner"
		});
		conn = con
		// test = con
		// return con
		// const result = await con.query(`select * from ??`,['index_table'])
		// console.table(result[0])
		return con
	}
	catch(err){
		return err
	}
}


async function get_saved_connection() {
	await connect().then(con => {
		console.log(conn)
	})
}

get_saved_connection()

module.exports = connect()




