function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

async function change_name(data,new_con) {
	// return
	try	{	
		var result = await new_con.query("SELECT part,question_paper FROM quiz WHERE topic_name = '"+data.old_topic_name+"'")
		result = result[0]
	}
	catch (err) {
		console.log(err)//throw err;
		res.json('failed')
		return
	}

	var changes_required = []
	for (var i=0; i<result.length; i++){
		changes_required.push({old:data.old_topic_name+result[i].part+result[i].question_paper,new:data.new_topic_name+result[i].part+result[i].question_paper})
	}
	console.log(changes_required)
	// return
	try {
		await new_con.query("UPDATE quiz SET topic_name = '"+data.new_topic_name+"' WHERE topic_name = '"+data.old_topic_name+"'")
	}
	catch (err) {
		console.log(err)//throw err;
		res.json('failed')
		return
	}
	for (var i=0; i<changes_required.length; i++){
		try{
			await new_con.query("ALTER TABLE "+changes_required[i].old+" RENAME TO "+changes_required[i].new)
		}
		catch (err) {
			console.log(err)//throw err;
			res.json('failed')
			return
		}
	}
		// res.json('success')

}

async function change_part(data,new_con){
	// return
	try{
		var result = await new_con.query("SELECT question_paper FROM quiz WHERE topic_name = '"+data.old_topic_name+"' AND part = '"+data.old_part_number+"'")
		result = result[0]
	}
	catch (err) {
		console.log(err)//throw err;
		res.json('failed')
		return
	}
	// console.log(result)
	// return
	var changes_required = []
	for (var i=0; i<result.length; i++){
		changes_required.push({old:data.old_topic_name+data.old_part_number+result[i].question_paper,new:data.old_topic_name+data.new_part_number+result[i].question_paper})
	}
	console.log(changes_required)
	// return
	try{
		await new_con.query("UPDATE quiz SET part = '"+data.new_part_number+"' WHERE topic_name = '"+data.old_topic_name+"' AND part = '"+data.old_part_number+"'")
	}
	catch (err) {
		console.log(err)//throw err;
		res.json('failed')
		return
	}
	for (var i=0; i<changes_required.length; i++){
		try{
			await new_con.query("ALTER TABLE "+changes_required[i].old+" RENAME TO "+changes_required[i].new)
		}
		catch (err) {
			console.log(err)//throw err;
			res.json('failed')
			return
		}
	}
}

async function change_question_paper(data,new_con){
	// return
	var changes_required = []
	changes_required.push({old:data.old_topic_name+data.old_part_number+data.old_question_paper,new:data.old_topic_name+data.old_part_number+data.new_question_paper})
	console.log(changes_required)
	// return
	try{
		await new_con.query("UPDATE quiz SET question_paper = '"+data.new_question_paper+"' WHERE topic_name = '"+data.old_topic_name+"' AND question_paper = '"+data.old_question_paper+"' AND part = '"+data.old_part_number+"'")
	}
	catch (err) {
		console.log(err)//throw err;
		res.json('failed')
		return
	}
	for (var i=0; i<changes_required.length; i++){
		try{
			await new_con.query("ALTER TABLE "+changes_required[i].old+" RENAME TO "+changes_required[i].new)
		}
		catch (err) {
			console.log(err)//throw err;
			res.json('failed')
			return
		}
	}
}

module.exports.shuffle = shuffle
module.exports.change_name = change_name
module.exports.change_part = change_part
module.exports.change_question_paper = change_question_paper

