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
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: "Quizabled" }));

// config for your database
var config = {
  user: "arun123sa",
  password: "Apple@123",
  server: "localhost",
  database: "quizabled",
  options: {
    trustedConnection: true,
  },
  trustServerCertificate: true,
};

// connect to your database
sql.connect(config, function (err) {
  if (err) console.log(err);
  else {
    console.log("connected!!!");
  }
});

app.get("/users", UserController.getUsers);
app.post("/login", LoginController.login);
app.get("/logout", LoginController.logout);
app.post(
  "/upload",
  ImageUploadController.upload.single("image"),
  ImageUploadController.imageUpload
);
app.post("/addQuestions", QuestionController.addQuestions);
app.get("/getQuestions", QuizController.getQuestions);

var server = app.listen(5000, function () {
  console.log("Server is running..");
});
