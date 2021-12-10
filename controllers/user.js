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
getUser = async function (req, res) {
  const query = `select id, 
  name, 
  user_name from user_profile where user_profile.id=${req.query.id}`;
  try {
    const result = await sql.query(query);
    res.status(200).send(result.recordset[0]);
  } catch (error) {}
};

exports.UserController = {
  getUsers: getUsers,
  getUser: getUser,
};
