var sql = require("mssql");
var getQuestions = async function (req, res) {
  const getQuery = `SELECT TOP 20 * from quiz_questions where 
  quiz_questions.isActive = 1 
  and 
  quiz_questions.languageCode='en' 
  and 
  quiz_questions.quizType='${req.body.quizType}' 
  and
  quiz_questions.category='${req.body.category}'
  ORDER BY NEWID()`;
  // const getQuery = `select * from quiz_questions where
  // quiz_questions.isActive = 1
  // and
  // quiz_questions.languageCode='en'
  // and
  // quiz_questions.quizType='${req.body.quizType}'
  // and
  // quiz_questions.category='${req.body.category}'`;
  try {
    const result = await sql.query(getQuery);
    let questionIds = "";
    if (result.recordset.length == 0) {
      res.status(404).end("No Records Found");
      return false;
    }
    result.recordset.forEach((questionObj, index, resultArray) => {
      questionIds += questionObj.questionId;
      if (resultArray.length - 1 != index) {
        questionIds += ",";
      }
    });
    const primaryQuestions = result.recordset;
    const primaryOptions = await getPrimaryOptions(req, res, questionIds);
    let regionalQuestions;
    let regionalOptions;
    if (req.body.language != "en") {
      regionalQuestions = await getRegionalQuestions(req, res, questionIds);
      let regionalQuestionIds = "";
      regionalQuestions.forEach((questionObj, index, resultArray) => {
        regionalQuestionIds += questionObj.questionId;
        if (resultArray.length - 1 != index) {
          regionalQuestionIds += ",";
        }
      });

      regionalOptions = await getRegionalOptions(req, res, regionalQuestionIds);
    }
    const questionsSet = {
      primaryQuestionsObj: {
        questions: primaryQuestions,
        options: primaryOptions,
      },
      secondaryQuestionsObj:
        req.body.language != "en"
          ? {
              questions: regionalQuestions,
              options: regionalOptions,
            }
          : null,
    };
    res.status(200).send(questionsSet);
  } catch (err) {
    res.status(500).send(err.message);
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
    res.status(500).send(err.message);
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
    res.status(500).send(err.message);
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
    res.status(500).send(err.message);
  }
};
var getAnswers = async function (req, res) {
  const answerQuery = `select quiz_questions.optionId, quiz_questions.questionId from quiz_questions 
    where quiz_questions.quizType=${req.body.quizType} and 
    quiz_questions.languageCode='en' and
    quiz_questions.isActive = 1 and 
    quiz_questions.category='${req.body.category}'`;
  try {
    const result = await sql.query(answerQuery);
    res.status(200).send(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
exports.QuizController = {
  getQuestions: getQuestions,
  getAnswers: getAnswers,
};
