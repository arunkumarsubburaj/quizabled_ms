var sql = require("mssql");
var getStudents = async function (req, res) {
  const getQuery = `select id, 
  name, 
  user_name, 
  gender, 
  dob, 
  institution, 
  email,
  city,
  phone,
  q_category,
  age,
  isAttended,
  startTime,
  endTime 
  from 
  user_profile where user_profile.role='STUDENT'`;
  try {
    const result = await sql.query(getQuery);
    res.status(200).send(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
var updateQuizStatus = async function (req, res) {
  let getQuery = "";
  if (req.body.isAttended == 1) {
    getQuery = `update user_profile 
  set isAttended=${req.body.isAttended}, 
  startTime=${req.body.timeStamp} where id=${req.query.studentId}`;
  } else if (req.body.isAttended == 2) {
    getQuery = `update user_profile 
      set isAttended=${req.body.isAttended}, 
      endTime=${req.body.timeStamp} where id=${req.query.studentId}`;
  } else {
    getQuery = `update user_profile 
    set isAttended='0', startTime=null,
    endTime=null where id=${req.query.studentId}`;
  }
  try {
    const result = await sql.query(getQuery);
    res.status(200).send(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
var addStudentLog = async function (req, res) {
  var insertLogs = `INSERT INTO student_log (question,
    questionId,
    questionNo,
    selectedValue,
    selectedOptionId,
    studentId) 
VALUES ${getAnswerValues(req.body.answerObj, req.query.studentId)}`;
  try {
    await deleteStudentLog(req, res);
    const result = await sql.query(insertLogs);
    res.status(200).send(result.recordset);
  } catch (err) {
    res.status(500).send(err);
  }
};
var deleteStudentLog = async function (req, res) {
  const deleteLogQuery = `delete from student_log where studentId = ${req.query.studentId}`;
  try {
    const result = await sql.query(deleteLogQuery);
    return result.recordset;
  } catch (error) {
    res.status(500).send(err);
  }
};
function getAnswerValues(answerArray, studentId) {
  var returnString = "";
  answerArray.forEach((answer, index, answers) => {
    var isLastOption = answers.length - 1 == index;
    var queryString = `(N'${
      answer.question ? answer.question.replace(/'/g, "''") : null
    }',
        '${answer.questionId}',
        '${answer.questionNo}',
        ${
          answer.selectedValue
            ? "N'" + answer.selectedValue.replace(/'/g, "''") + "'"
            : null
        },
        '${answer.selectedOptionId}', 
        '${studentId}'
        )`;
    returnString += `${queryString}${isLastOption ? "" : ","}`;
  });
  return returnString;
}
var getStudentLog = async function (req, res) {
  const selectQuery = `select * from student_log where studentId = ${req.query.studentId}`;
  try {
    const result = await sql.query(selectQuery);
    res.status(200).send(result.recordset);
  } catch (error) {
    res.status(500).send(err);
  }
};
var unlockStudent = async function (req, res) {
  const resetStatusQuery = `update user_profile 
    set isAttended='0', startTime=null,
    endTime=null where id=${req.query.studentId}`;
  const resetLogQuery = `delete from student_log where studentId = ${req.query.studentId}`;
  try {
    await sql.query(resetStatusQuery);
    const result = await sql.query(resetLogQuery);
    res.status(200).send(result.recordset);
  } catch (error) {
    res.status(500).send(err);
  }
};
exports.StudentController = {
  getStudents: getStudents,
  updateQuizStatus: updateQuizStatus,
  addStudentLog: addStudentLog,
  getStudentLog: getStudentLog,
  unlockStudent: unlockStudent,
};
