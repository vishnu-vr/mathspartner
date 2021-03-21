module.exports = {
	GetTopic: async function (parent){
		try{
			var dbo = db.db(DB.mathspartner);
	  		var query = { parent: parent };
	  		var result = await dbo.collection(DB.topics).find(query).toArray();
	  		return result;
		}
		catch(error){
			console.error(error)
		}
	},
	AddTopic: async function(doc){
	  try{
	  	var dbo = db.db(DB.mathspartner);
	  	var result = await dbo.collection(DB.topics).insertOne(doc);
	  	console.log(result.insertedId)
	  }
	  catch(error){
	  	console.error(error)
	  }
	},
	GetTopicsViaQuery: async function (query){
		try{
			var dbo = db.db(DB.mathspartner);
	  		var result = await dbo.collection(DB.topics).find(query).toArray();
	  		return result;
		}
		catch(error){
			console.error(error)
		}
	},
	RenameTopicParent: async function(oldName, newName){
		try{
	  		var dbo = db.db(DB.mathspartner);
	  		var options = { upsert: false };
			const filter = { parent: oldName };

	  	    const updateDoc = {
				$set: {
					parent: newName
				},
			};

			await dbo.collection(DB.topics).updateOne(filter, updateDoc, options);
		}
		catch(error){
			console.error(error)
		}
	},
	ChangeParent: async function(oldParent, newParent, child){
		try{
	  		var dbo = db.db(DB.mathspartner);
	  		var options = { upsert: false };
			const filter = { 
				parent: oldParent,
				child: child
			};

	  	    const updateDoc = {
				$set: {
					parent: newParent
				},
			};

			await dbo.collection(DB.topics).updateOne(filter, updateDoc, options);
		}
		catch(error){
			console.error(error)
		}
	},
	RenameTopicChild: async function(parent, oldChild, newChild){
		try{
	  		var dbo = db.db(DB.mathspartner);
	  		var options = { upsert: false };
			const filter = { parent: parent, child: oldChild };

	  	    const updateDoc = {
				$set: {
					child: newChild
				},
			};

			await dbo.collection(DB.topics).updateOne(filter, updateDoc, options);
		}
		catch(error){
			console.error(error)
		}
	},
	DeleteTopic: async function(parent, child){
		try{
	  		var dbo = db.db(DB.mathspartner);
			await dbo.collection(DB.topics).deleteOne({parent: parent, child: child});
		}
		catch(error){
			console.error(error)
		}
	},
	DeleteTopicsViaQuery: async function (query){
		try{
			var dbo = db.db(DB.mathspartner);
	  		var result = await dbo.collection(DB.topics).deleteMany(query);
	  		return result;
		}
		catch(error){
			console.error(error)
		}
	},
	UpdatePDFPath: async function (pdfPath, parent){
		try{
			var dbo = db.db(DB.mathspartner);
			var options = { upsert: false };
		  	const filter = { parent: parent};

			const updateDoc = {
			  $set: {
				  pdf_path: pdfPath
			  },
		  	};

		  await dbo.collection(DB.topics).updateOne(filter, updateDoc, options);
	  }
	  catch(error){
		  console.error(error)
	  }
	},
	GetTopicModel: function(parent="",child="",on_off="",
		duration="",pdf_path="",type="",
		date="",show_answers=""){
	    return {
	        "parent": parent,
	        "child": child,
	        "on_off": on_off,
	        "duration": duration,
	        "pdf_path": pdf_path,
	        "type": type,
	        "date": date,
	        "show_answers": show_answers
	    };
	},
}