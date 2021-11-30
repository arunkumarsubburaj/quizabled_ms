var sql = require("mssql");
var addQuestions = async function (req, res) {
  for (var qIndex = 0; qIndex < req.body.length; qIndex++) {
    var currentQuestion = req.body[qIndex];
    if (!!currentQuestion.category) {
    } else {
      res
        .status(404)
        .send("Something went wrong. Try resubmitting the data...");
      return false;
    }
    var insertQuery = `INSERT INTO quiz_questions (question, questionImage, languageCode, category, isActive, primaryQuestionId, quizType) 
    VALUES (N'${currentQuestion.question}', 
    '${currentQuestion.questionImage}', 
    '${currentQuestion.languageCode}', 
    '${currentQuestion.category}', 
    ${
      currentQuestion.isActive == "true" || currentQuestion.isActive == true
        ? 1
        : 0
    },
    ${currentQuestion.primaryQuestionId},
    ${currentQuestion.quizType});`;
    try {
      const result = await sql.query(insertQuery);
      await getUpdatedId(req, res, qIndex);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
};
async function getUpdatedId(req, res, qIndex) {
  var lastModifiedId = `SELECT IDENT_CURRENT('quiz_questions');`;
  try {
    const result = await sql.query(lastModifiedId);
    var updatedQuestionId = result.recordset[0][""];
    await addOptions(req, res, updatedQuestionId, qIndex);
    await updateQuestionIdToOtherLang(req, res, updatedQuestionId);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
function updateQuestionIdToOtherLang(req, res, updatedQuestionId) {
  req.body.forEach((que, index) => {
    if (
      que.languageCode != "en" &&
      (que.primaryQuestionId == null || que.primaryQuestionId == undefined)
    ) {
      que.primaryQuestionId = updatedQuestionId;
    }
  });
}
async function addOptions(req, res, updatedQuestionId, qIndex) {
  console.log(qIndex);
  var insertOptions = `INSERT INTO quiz_options( options,optionImage,questionId,isActive,isAnswer) 
VALUES ${getOptionValues(req.body[qIndex].options, updatedQuestionId)};`;
  try {
    const result = await sql.query(insertOptions);
    await getAnswerOptionId(req, res, updatedQuestionId, qIndex);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
function getOptionValues(options, questionId) {
  var returnString = "";
  options.forEach((option, index, options) => {
    var isLastOption = options.length - 1 == index;
    var queryString = `(N'${option.options}',
    '${option.optionImage}',
    ${questionId},
    ${option.isActive == "true" || option.isActive == true ? 1 : 0}, 
    ${option.isAnswer == "true" || option.isAnswer == true ? 1 : 0})`;
    returnString += `${queryString}${isLastOption ? "" : ","}`;
  });
  return returnString;
}
async function getAnswerOptionId(req, res, updatedQuestionId, qIndex) {
  var query = `select (optionId) from quiz_options where isAnswer=1 and questionId = ${updatedQuestionId};`;
  try {
    const result = await sql.query(query);
    var optionId = result.recordset[0].optionId;
    await updateOptionIdToQuestion(
      req,
      res,
      updatedQuestionId,
      optionId,
      qIndex
    );
  } catch (err) {
    res.status(500).send(err.message);
  }
}
async function updateOptionIdToQuestion(
  req,
  res,
  questionId,
  optionId,
  qIndex
) {
  var query = `UPDATE quiz_questions SET optionId = ${optionId} WHERE quiz_questions.questionId = ${questionId};`;
  try {
    const result = await sql.query(query);
    console.log(`${qIndex + 1} is updated`);
    if (qIndex == req.body.length - 1) {
      res.status(200).send(result);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}
var getAllQuestions = async function (req, res) {
  var questionQuery = `select questionId, question, questionImage, category, isActive, quizType 
  from quiz_questions 
  where quiz_questions.languageCode='en' 
  and quiz_questions.category='${req.query.category}' 
  and  quiz_questions.quizType=${req.query.quizType}
  and  quiz_questions.isActive=${req.query.isActive}`;
  try {
    const questionResult = await sql.query(questionQuery);
    const questionArray = questionResult.recordset;
    if (questionArray.length == 0) {
      res.send(404).status({ message: "No Records Found" });
    } else {
      let questionIds = "";
      questionArray.forEach((questionObj, index, qArray) => {
        questionIds += questionObj.questionId;
        if (index != qArray.length - 1) {
          questionIds += ",";
        }
      });
      const optionArray = await getOptions(req, res, questionIds);
      res.status(200).send({ questionArray, optionArray });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
async function getOptions(req, res, questionIds) {
  var optionQuery = `select options, optionImage,questionId, isActive, isAnswer, optionId 
  from quiz_options where questionId in (${questionIds})`;
  try {
    const optionResult = await sql.query(optionQuery);
    return optionResult.recordset;
  } catch (error) {
    res.status(500).send(error.message);
  }
}
var getQuestion = async function (req, res) {
  var qnArrayQuery = `select * from quiz_questions 
  where (quiz_questions.questionId=${req.query.questionId} 
    or quiz_questions.primaryQuestionId=${req.query.questionId})`;
  try {
    var result = await sql.query(qnArrayQuery);
    var questionArray = result.recordset;
    if (questionArray.length == 0) {
      res.status(404).end("No Records Found...");
    } else {
      let questionIds = "";
      questionArray.forEach((questionObj, index, qArray) => {
        questionIds += questionObj.questionId;
        if (index != qArray.length - 1) {
          questionIds += ",";
        }
      });
      const optionArray = await getOptions(req, res, questionIds);
      res.status(200).send({ questionArray, optionArray });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
var editQuestion = async function (req, res) {
  for (var qIndex = 0; qIndex < req.body.length; qIndex++) {
    var currentQuestion = req.body[qIndex];
    if (!!currentQuestion.category) {
    } else {
      res
        .status(404)
        .send("Something went wrong. Try resubmitting the data...");
      return false;
    }
    var updateQuery = `update quiz_questions set question=N'${currentQuestion.question}',
    questionImage='${currentQuestion.questionImage}',
    category='${currentQuestion.category}' where questionId=${currentQuestion.questionId};`;
    try {
      const result = await sql.query(updateQuery);
      await updateOptions(req, res, qIndex, currentQuestion.questionId);
      if (qIndex == req.body.length - 1) {
        res.status(200).send({ message: "Question Updated Successfully!" });
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
};
async function updateOptions(req, res, qIndex, questionId) {
  var optionArray = req.body[qIndex].options;
  optionArray.forEach(async (optionObj) => {
    const updateOptionQuery = `update quiz_options set options=N'${
      optionObj.options
    }',
    optionImage='${optionObj.optionImage}',
    isAnswer=${
      optionObj.isAnswer == "true" || optionObj.isAnswer == true ? 1 : 0
    } where optionId=${optionObj.optionId}`;
    try {
      await sql.query(updateOptionQuery);
      if (optionObj.isAnswer == "true" || optionObj.isAnswer == true) {
        await changeOptionIdOnQuestion(req, res, optionObj, qIndex);
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
}
async function changeOptionIdOnQuestion(req, res, optionObj, qIndex) {
  const answerOptionId = optionObj.optionId;
  const Ans_Id_To_Que_Query = `update quiz_questions set optionId=${answerOptionId} 
    where questionId=${req.body[qIndex].questionId}`;
  try {
    await sql.query(Ans_Id_To_Que_Query);
  } catch (error) {
    res.status(500).send(error.message);
  }
}
var deleteQuestion = async function (req, res) {
  var questionQuery = `update quiz_questions set isActive = 0 
  where quiz_questions.questionId=${req.query.questionId} 
  or 
  quiz_questions.primaryQuestionId=${req.query.questionId}`;
  var optionQuery = `update quiz_options set isActive = 0 
  where quiz_options.questionId=${req.query.questionId}`;
  try {
    await sql.query(questionQuery);
    await sql.query(optionQuery);
    var secondaryQuestionArray = `select questionId from quiz_questions where primaryQuestionId=${req.query.questionId}`;
    var secondaryArrayResult = await sql.query(secondaryQuestionArray);
    var secondaryQuestionArray = secondaryArrayResult.recordset;
    var secQueString = "";
    secondaryQuestionArray.forEach((secQueId, index, qArray) => {
      secQueString += secQueId.questionId;
      if (index != qArray.length - 1) {
        secQueString += ",";
      }
    });
    var secOptionQuery = `update quiz_options set isActive = 0 
    where quiz_options.questionId in (${secQueString})`;
    await sql.query(secOptionQuery);
    res.status(200).send({ message: "Question Deleted!!!" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
exports.QuestionController = {
  addQuestions: addQuestions,
  getAllQuestions: getAllQuestions,
  getQuestion: getQuestion,
  editQuestion: editQuestion,
  deleteQuestion: deleteQuestion,
};
