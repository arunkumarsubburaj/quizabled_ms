var express = require("express");
var sql = require("mssql");
var bodyParser = require("body-parser");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var cors = require("cors");
var multer = require("multer");

const { getUsers } = require("./controllers/user");
const { LoginController } = require("./controllers/login");
const { ImageUpload } = require("./controllers/imageUpload");
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: "Quizabled" }));
const upload = multer({
  storage: ImageUpload.storage,
  fileFilter: ImageUpload.fileFilter,
});

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

app.get("/users", getUsers);
app.post("/login", LoginController.login);
app.get("/logout", LoginController.logout);
app.post("/upload", upload.single("image"), ImageUpload.imageUpload);

var server = app.listen(5000, function () {
  console.log("Server is running..");
});
