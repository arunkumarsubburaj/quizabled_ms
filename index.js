var express = require("express");
var app = express();
var sql = require("mssql");
var bodyParser = require("body-parser");
var multer = require("multer");
var upload = multer();
var session = require("express-session");
var cookieParser = require("cookie-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(cookieParser());
app.use(session({ secret: "Quizabled" }));
var users = [];
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
app.get("/", function (req, res) {
  // create Request object
  var request = new sql.Request();
  // query to the database and get the records
  request.query("select * from user_profile", function (err, recordset) {
    if (err) console.log(err);
    // send records as a response
    users = recordset.recordset;
    res.status(200).send(users);
  });
});
app.post("/login", function (req, res) {
  console.log(req.body);
  console.log(users);
  for (let i = 0; i < users.length; i++) {
    var user = users[i];
    if (
      user.user_name === req.body.user_name &&
      user.password === req.body.password
    ) {
      req.session.user = user;
      break;
    }
  }
  if (req.session.user) {
    res.status(200).send(user);
  } else {
    res.status(404).send("User not found");
  }
});

app.get("/logout", function (req, res) {
  req.session.destroy(function () {
    res.status(200).send("user logged out.");
  });
  // res.redirect("/login");
});

app.use("/protected_page", function (err, req, res, next) {
  res.status(500).send(err);
  //User should be authenticated! Redirect him to log in.
  // res.redirect("/login");
});

var server = app.listen(5000, function () {
  console.log("Server is running..");
});
