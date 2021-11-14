var sql = require("mssql");
var addQuestions = async function (req, res) {
  for (var qIndex = 0; qIndex < req.body.length; qIndex++) {
    var currentQuestion = req.body[qIndex];
    var insertQuery = `INSERT INTO quiz_questions (question, questionImage, languageCode, category, isActive) 
    VALUES ('${currentQuestion.question}', 
    '${currentQuestion.questionImage}', 
    '${currentQuestion.languageCode}', 
    '${currentQuestion.category}', 
    ${
      currentQuestion.isActive == "true" || currentQuestion.isActive == true
        ? 1
        : 0
    });`;
    try {
      const result = await sql.query(insertQuery);
      await getUpdatedId(req, res, qIndex);
    } catch (err) {
      res.status(500).send(err);
    }
  }
};
async function getUpdatedId(req, res, qIndex) {
  var lastModifiedId = `SELECT IDENT_CURRENT('quiz_questions');`;
  try {
    const result = await sql.query(lastModifiedId);
    var updatedQuestionId = result.recordset[0][""];
    addOptions(req, res, updatedQuestionId, qIndex);
  } catch (err) {
    res.status(500).send(err);
  }
}
async function addOptions(req, res, updatedQuestionId, qIndex) {
  console.log(qIndex);
  var insertOptions = `INSERT INTO quiz_options( options,optionImage,questionId,isActive,isAnswer) 
VALUES ${getOptionValues(req.body[qIndex].options, updatedQuestionId)};`;
  try {
    const result = await sql.query(insertOptions);
    getAnswerOptionId(req, res, updatedQuestionId, qIndex);
  } catch (err) {
    res.status(500).send(err);
  }
}
function getOptionValues(options, questionId) {
  var returnString = "";
  options.forEach((option, index, options) => {
    var isLastOption = options.length - 1 == index;
    var queryString = `('${option.options}',
    '${option.optionImage}',
    '${questionId}',
    '${option.isActive == "true" || option.isActive == true ? 1 : 0}', 
    '${option.isAnswer == "true" || option.isAnswer == true ? 1 : 0}')`;
    returnString += `${queryString}${isLastOption ? "" : ","}`;
  });
  return returnString;
}
async function getAnswerOptionId(req, res, updatedQuestionId, qIndex) {
  var query = `select (optionId) from quiz_options where isAnswer=1 and questionId = ${updatedQuestionId};`;
  try {
    const result = await sql.query(query);
    var optionId = result.recordset[0].optionId;
    updateOptionIdToQuestion(req, res, updatedQuestionId, optionId, qIndex);
  } catch (err) {
    res.status(500).send(err);
  }
}
async function updateOptionIdToQuestion(
  req,
  res,
  questionId,
  optionId,
  qIndex
) {
  var request = new sql.Request();
  var query = `UPDATE quiz_questions SET optionId = ${optionId} WHERE quiz_questions.questionId = ${questionId};`;
  try {
    const result = await sql.query(query);
    console.log(`${qIndex + 1} is updated`);
    if (qIndex == req.body.length - 1) {
      res.status(200).send(result);
    }
  } catch (err) {
    res.status(500).send(err);
  }
}
exports.QuestionController = {
  addQuestions: addQuestions,
};
