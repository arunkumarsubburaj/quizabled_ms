var express = require("express");
var sql = require("mssql");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var cors = require("cors");

const { UserController } = require("./controllers/user");
const { LoginController } = require("./controllers/login");
const { ImageUploadController } = require("./controllers/imageUpload");
const { QuestionController } = require("./controllers/questions");
const { QuizController } = require("./controllers/quiz");
const { FileUploadController } = require("./controllers/resource");
const { StudentController } = require("./controllers/student");

var app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(cookieParser());
app.use(session({ secret: "Quizabled" }));

// config for your database

// var config = {
//   user: "arun123sa",
//   password: "Apple@123",
//   server: "localhost",
//   database: "quizabled",
//   options: {
//     trustedConnection: true,
//   },
//   trustServerCertificate: true,
// };

var config = {
  user: "developer",
  password: "quizabled@#$2021",
  server: "3.110.98.117",
  database: "quizabled",
  options: {
    trustedConnection: true,
  },
  trustServerCertificate: true,
};

(async function () {
  try {
    await sql.connect(config);
    console.log("DB connected");
    app.get("/quizabled_node/quizabled_ms/api/users", UserController.getUsers);
    app.post("/quizabled_node/quizabled_ms/api/login", LoginController.login);
    app.get("/quizabled_node/quizabled_ms/api/logout", LoginController.logout);
    app.post(
      "/quizabled_node/quizabled_ms/api/upload",
      ImageUploadController.upload.single("image"),
      ImageUploadController.imageUpload
    );
    app.post(
      "/quizabled_node/quizabled_ms/api/addQuestions",
      QuestionController.addQuestions
    );
    app.post(
      "/quizabled_node/quizabled_ms/api/getQuestions",
      QuizController.getQuestions
    );
    app.post(
      "/quizabled_node/quizabled_ms/api/getAnswers",
      QuizController.getAnswers
    );
    app.get(
      "/quizabled_node/quizabled_ms/api/getAllQuestions",
      QuestionController.getAllQuestions
    );
    app.get(
      "/quizabled_node/quizabled_ms/api/getQuestion",
      QuestionController.getQuestion
    );
    app.put(
      "/quizabled_node/quizabled_ms/api/editQuestion",
      QuestionController.editQuestion
    );
    app.delete(
      "/quizabled_node/quizabled_ms/api/deleteQuestion",
      QuestionController.deleteQuestion
    );
    app.get(
      "/quizabled_node/quizabled_ms/api/getStudents",
      StudentController.getStudents
    );
    app.post(
      "/quizabled_node/quizabled_ms/api/updateQuizStatus",
      StudentController.updateQuizStatus
    );
    app.post(
      "/quizabled_node/quizabled_ms/api/addStudentLog",
      StudentController.addStudentLog
    );
    app.get(
      "/quizabled_node/quizabled_ms/api/getStudentLog",
      StudentController.getStudentLog
    );
    app.get(
      "/quizabled_node/quizabled_ms/api/unlockStudent",
      StudentController.unlockStudent
    );
    app.get("/quizabled_node/quizabled_ms/api/getUser", UserController.getUser);
    app.post("/addUsers", UserController.postDetails);
  } catch (error) {
    console.log(error);
  }
})();

app.get(
  "/quizabled_node/quizabled_ms/api/getFileNames",
  FileUploadController.getListFiles
);
app.post(
  "/quizabled_node/quizabled_ms/api/uploadFile",
  FileUploadController.upload.single("resource"),
  FileUploadController.fileUpload
);
app.get(
  "/quizabled_node/quizabled_ms/api/download",
  FileUploadController.download
);

// connect to your database
// var server = app.listen(process.env.PORT, function () {
// console.log("Server is running..");
// });

var server = app.listen(5000, function () {
  console.log("Server is running..");
});
