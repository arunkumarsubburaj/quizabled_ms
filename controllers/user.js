var sql = require("mssql");
getUsers = function (req, res) {
  // create Request object
  var request = new sql.Request();
  // query to the database and get the records
  request.query("select * from user_profile", function (err, recordset) {
    if (err) console.log(err);
    // send records as a response
    users = recordset.recordset;
    res
      .status(200)
      .send({ data: users, message: "User Data Fetched Successfully" });
  });
};

exports.UserController = {
  getUsers: getUsers,
};
