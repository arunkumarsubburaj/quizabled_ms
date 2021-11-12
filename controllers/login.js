var sql = require("mssql");
const cookieParser = require("cookie-parser");
var jwt = require("jsonwebtoken");
var fs = require("fs");

const RSA_PRIVATE_KEY = fs.readFileSync("private.key");
var login = function (req, res) {
  console.log(req.body);
  // console.log(users);
  var request = new sql.Request();
  request.query(
    `SELECT id
    ,name
    ,user_name
    ,gender
    ,dob
    ,institution
    ,role
    ,email
    ,city
    ,phone
    ,q_category
    ,age
    ,isAttended
  FROM user_profile where email='${req.body.email}' and password='${req.body.password}'`,
    function (err, recordset) {
      if (err) console.log(err);
      // send records as a response
      if (recordset.recordset.length > 0) {
        req.session.user = recordset.recordset;
        const jwtBearerToken = jwt.sign(
          recordset.recordset[0],
          RSA_PRIVATE_KEY,
          {
            expiresIn: 9999999,
            subject: recordset.recordset[0].user_name,
          }
        );
        const expiresIn = jwt.decode(jwtBearerToken).exp;
        res.status(200).send({
          user: recordset.recordset[0],
          token: jwtBearerToken,
          expiresIn: expiresIn,
        });
      } else {
        res.status(404).send({ code: 404, message: "Login Failed!!!" });
      }
    }
  );
};
var logout = function (req, res) {
  req.session.destroy(function () {
    res.status(200).send("user logged out.");
  });
};
exports.LoginController = {
  login: login,
  logout: logout,
};
