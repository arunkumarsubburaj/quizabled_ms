var express = require("express");
var app = express();
app.use(express.json());
app.use(express.urlencoded());
const request = require("request");
const category_A_ans_Array = [
  {
    optionId: 1053,
    questionId: 264,
  },
  {
    optionId: 1118,
    questionId: 280,
  },
  {
    optionId: 1200,
    questionId: 300,
  },
  {
    optionId: 1071,
    questionId: 268,
  },
  {
    optionId: 1357,
    questionId: 340,
  },
  {
    optionId: 1087,
    questionId: 272,
  },
  {
    optionId: 1134,
    questionId: 284,
  },
  {
    optionId: 1149,
    questionId: 288,
  },
  {
    optionId: 1165,
    questionId: 292,
  },
  {
    optionId: 1181,
    questionId: 296,
  },
  {
    optionId: 1213,
    questionId: 304,
  },
  {
    optionId: 1229,
    questionId: 308,
  },
  {
    optionId: 1245,
    questionId: 312,
  },
  {
    optionId: 1264,
    questionId: 316,
  },
  {
    optionId: 1278,
    questionId: 320,
  },
  {
    optionId: 1102,
    questionId: 276,
  },
  {
    optionId: 1293,
    questionId: 324,
  },
  {
    optionId: 1310,
    questionId: 328,
  },
  {
    optionId: 1327,
    questionId: 332,
  },
  {
    optionId: 1344,
    questionId: 336,
  },
  {
    optionId: 1375,
    questionId: 344,
  },
];
const category_B_ans_Array = [
  {
    optionId: 1407,
    questionId: 352,
  },
  {
    optionId: 1471,
    questionId: 368,
  },
  {
    optionId: 1486,
    questionId: 372,
  },
  {
    optionId: 1454,
    questionId: 364,
  },
  {
    optionId: 1502,
    questionId: 376,
  },
  {
    optionId: 1517,
    questionId: 380,
  },
  {
    optionId: 1536,
    questionId: 384,
  },
  {
    optionId: 1549,
    questionId: 388,
  },
  {
    optionId: 1581,
    questionId: 396,
  },
  {
    optionId: 1645,
    questionId: 412,
  },
  {
    optionId: 1389,
    questionId: 348,
  },
  {
    optionId: 1677,
    questionId: 420,
  },
  {
    optionId: 1693,
    questionId: 424,
  },
  {
    optionId: 1421,
    questionId: 356,
  },
  {
    optionId: 1437,
    questionId: 360,
  },
  {
    optionId: 1565,
    questionId: 392,
  },
  {
    optionId: 1663,
    questionId: 416,
  },
  {
    optionId: 1598,
    questionId: 400,
  },
  {
    optionId: 1613,
    questionId: 404,
  },
  {
    optionId: 1629,
    questionId: 408,
  },
];
var make_API_call = function (requestOptions) {
  return new Promise((resolve, reject) => {
    request(requestOptions, (err, res, body) => {
      if (err) reject(err);
      resolve(body);
    });
  });
};
var calculateMarks = async function (req, res) {
  const finalUserObj = [];
  const userDataOptions = {
    url: "https://quizabled.com/quizabled_node/quizabled_ms/api/users",
    method: "GET",
    json: {},
  };
  try {
    const userObj = await make_API_call(userDataOptions);
    const userData = userObj.data;
    const studentData = userData.filter((user) => {
      return (
        user.role == "STUDENT" &&
        user.isAttended == 2 &&
        user.endTime &&
        (user.q_category == "A" || user.q_category == "B")
      );
    });
    const filteredStudentData = studentData.filter(
      (studentData, curIndex, sortedArray) => {
        return curIndex >= 400 && curIndex < 500;
      }
    );
    for (var i = 0; i < filteredStudentData.length; i++) {
      const student = filteredStudentData[i];
      const resultLogOptions = {
        url:
          "https://quizabled.com/quizabled_node/quizabled_ms/api/getStudentLog?studentId=" +
          student.id,
        method: "GET",
        json: {},
      };
      const answerArray =
        student.q_category == "A" ? category_A_ans_Array : category_B_ans_Array;
      let questionsAnswered = 0;
      try {
        const resultArray = await make_API_call(resultLogOptions);
        resultArray.forEach((resultObj) => {
          const answerObj = answerArray.filter((answerObj) => {
            return answerObj.questionId == resultObj.questionId;
          })[0];
          if (
            resultObj.selectedOptionId &&
            resultObj.selectedOptionId == answerObj.optionId
          ) {
            questionsAnswered += 1;
          }
        });
        student["totalMarks"] = questionsAnswered;
        finalUserObj.push(student);
      } catch (error) {
        console.log(error);
      }
    }
    res.status(200).send(finalUserObj);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};
// calculateMarks();
exports.MarksController = {
  calculateMarks: calculateMarks,
};
