var sql = require("mssql");
exports.getUsers = function (req, res) {
  // create Request object
  var request = new sql.Request();
  // query to the database and get the records
  request.query("select * from user_profile", function (err, recordset) {
    if (err) console.log(err);
    // send records as a response
    users = recordset.recordset;
    res.status(200).send("User Data Fetched Successfully");
  });
};
