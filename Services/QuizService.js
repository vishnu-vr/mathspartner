module.exports = {
    UpdatePaper: async function(quizName, questionsAndAnswersList){
        try{
            var dbo = db.db("mathspartner");
            var options = { upsert: false };
            const filter = { name: quizName };

            const updateDoc = {
                $set: {
                    questions_and_answers_list: questionsAndAnswersList
                },
            };

            await dbo.collection("papers").updateOne(filter, updateDoc, options);
        }
        catch(error){
            console.error(error)
        }
    },
	GetQuestionsAndAnswersModel: function(question="",correct="",section="",options=[]){
	    return {
            question: question,
            correct: correct,
            section: section,
            options: options
        };
	},
    GetPaperModel: function (quizName="", questionsAndAnswersList=[]){
        return {
            name: quizName,
            questions_and_answers_list: questionsAndAnswersList
        };
    },
	AddPaper: async function(doc){
        try{
            var dbo = db.db("mathspartner");
            var result = await dbo.collection("papers").insertOne(doc);
            console.log(result.insertedId)
        }
        catch(error){
            console.error(error)
        }
    },
    GetQuiz: async function (quizName){
		try{
			var dbo = db.db("mathspartner");
	  		var query = { name: quizName };
	  		var result = await dbo.collection("papers").find(query).toArray();
	  		return result;
		}
		catch(error){
			console.error(error)
		}
	},
    RenameQuizName: async function (oldName, newName){
        try{
            var dbo = db.db("mathspartner");
            var options = { upsert: false };
            const filter = { name: oldName };

            const updateDoc = {
                $set: {
                    name: newName
                },
            };

            await dbo.collection("papers").updateOne(filter, updateDoc, options);
        }
        catch(error){
            console.error(error)
        }
    },
    DeleteQuiz: async function (name){
        try{
            var dbo = db.db("mathspartner");
            await dbo.collection("papers").deleteOne({name: name});
        }
        catch(error){
            console.error(error)
        }
    },
    UpdateQuizTopicMetaData: async function (quizName, pdfPath, duration, showAnswers, onOff){
		try{
			var dbo = db.db("mathspartner");
			var options = { upsert: false };
		  	const filter = { parent: quizName};

			const updateDoc = {
			  $set: {
				on_off: onOff,
				duration: duration,
				pdf_path: pdfPath,
				show_answers: showAnswers
			  },
		  	};

		  await dbo.collection("topics").updateOne(filter, updateDoc, options);
	  }
	  catch(error){
		  console.error(error)
	  }
	},
}