var mongo = require('mongodb');

module.exports = {
    GetUserResultModel: function (
        name,
        score,
        correct,
        wrong,
        na,
        date,
        quizName,
        timeTaken
    ){
        return {
            "name": name,
            "score": score,
            "correct": correct,
            "wrong": wrong,
            "na": na,
            "date": date,
            "quiz_name": quizName,
            "time_taken": timeTaken,
        };
    },
	AddUserResult: async function(doc){
        try{
            var dbo = db.db(DB.mathspartner);
            var result = await dbo.collection(DB.user_results).insertOne(doc);
            console.log(result.insertedId)
        }
        catch(error){
            console.error(error)
        }
    },
    GetResults: async function (date){
		try{
			var dbo = db.db(DB.mathspartner);
	  		var query = {date:date};
	  		var result = await dbo.collection(DB.user_results).find(query).sort({score: -1, time_taken: 1}).toArray();
	  		return result;
		}
		catch(error){
			console.error(error)
		}
	},
    GetResultsByQuizName: async function (quizName){
		try{
			var dbo = db.db(DB.mathspartner);
	  		var query = {quiz_name:quizName};
	  		var result = await dbo.collection(DB.user_results).find(query).sort({score: -1, time_taken: 1}).toArray();
	  		return result;
		}
		catch(error){
			console.error(error)
		}
	},
    DeleteUserResultById: async function (id){
		try{
            var dbo = db.db(DB.mathspartner);
            var o_id = new mongo.ObjectID(id);
            await dbo.collection(DB.user_results).deleteOne({_id: o_id});
            return;
        }
        catch(error){
            console.error(error)
        }
    },
    GetQuizList: async function (){
		try{
			var dbo = db.db(DB.mathspartner);
	  		var result = await dbo.collection(DB.user_results).distinct("quiz_name");
            result = result.slice(1,result.length);
            var ret = [];
            result.forEach(resultSingle => {
                ret.push({
                    quiz_name:resultSingle
                });
            });
	  		return ret;
		}
		catch(error){
			console.error(error)
		}
	},
}