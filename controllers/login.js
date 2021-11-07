var sql = require("mssql");
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
        req.session.user = recordset;
        res.status(200).send(recordset.recordset[0]);
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
