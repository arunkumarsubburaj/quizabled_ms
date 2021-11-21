var sql = require("mssql");
var getQuestions = async function (req, res) {
  const getQuery = `select * from quiz_questions where 
  quiz_questions.isActive = 1 
  and 
  quiz_questions.languageCode='en' 
  and 
  quiz_questions.quizType='${req.body.quizType}' 
  and
  quiz_questions.category='${req.body.category}'`;
  try {
    const result = await sql.query(getQuery);
    let questionIds = "";
    result.recordset.forEach((questionObj, index, resultArray) => {
      questionIds += questionObj.questionId;
      if (resultArray.length - 1 != index) {
        questionIds += ",";
      }
    });
    const primaryQuestions = result.recordset;
    const regionalQuestions = await getRegionalQuestions(req, res, questionIds);
    let regionalQuestionIds = "";
    regionalQuestions.forEach((questionObj, index, resultArray) => {
      regionalQuestionIds += questionObj.questionId;
      if (resultArray.length - 1 != index) {
        regionalQuestionIds += ",";
      }
    });

    const primaryOptions = await getPrimaryOptions(req, res, questionIds);
    const regionalOptions = await getRegionalOptions(
      req,
      res,
      regionalQuestionIds
    );
    const questionsSet = {
      primaryQuestionsObj: {
        questions: primaryQuestions,
        options: primaryOptions,
      },
      secondaryQuestionObj: {
        questions: regionalQuestions,
        options: regionalOptions,
      },
    };
    res.status(200).send(questionsSet);
  } catch (err) {
    res.status(500).send(err);
  }
};
var getRegionalQuestions = async function (req, res, primaryQuestionIds) {
  const getSecondaryQuestionsQuery = `select * from quiz_questions where 
    quiz_questions.isActive = 1 
    and 
    quiz_questions.languageCode='${req.body.language}' 
    and 
    quiz_questions.quizType='${req.body.quizType}' 
    and 
    quiz_questions.primaryQuestionId in (${primaryQuestionIds})`;
  try {
    const result = await sql.query(getSecondaryQuestionsQuery);
    return result.recordset;
  } catch (err) {
    res.status(500).send(err);
  }
};
var getPrimaryOptions = async function (req, res, primaryQuestionIds) {
  const getOptionsQuery = `select * from quiz_options where 
  quiz_options.isActive = 1 
  and 
  quiz_options.questionId in (${primaryQuestionIds})`;
  try {
    const result = await sql.query(getOptionsQuery);
    return result.recordset;
  } catch (err) {
    res.status(500).send(err);
  }
};
var getRegionalOptions = async function (req, res, reqionalQuestionIds) {
  const getOptionsQuery = `select * from quiz_options where 
    quiz_options.isActive = 1 
    and 
    quiz_options.questionId in (${reqionalQuestionIds})`;
  try {
    const result = await sql.query(getOptionsQuery);
    return result.recordset;
  } catch (err) {
    res.status(500).send(err);
  }
};
exports.QuizController = {
  getQuestions: getQuestions,
};
