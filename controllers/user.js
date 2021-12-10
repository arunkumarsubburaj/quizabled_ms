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
var postDetails = async function (req, res) {
  const query = `INSERT INTO user_profile (name,
    user_name,
    password,
    dob,
    institution,
    role,
    email,
    city,
    phone,
    q_category,
    age,
    isAttended) 
VALUES ${getAnswerValues(req.body)}`;
  try {
    const result = await sql.query(query);
    res.status(200).send(result.recordset);
  } catch (err) {
    res.status(500).send(err);
  }
};

function getAnswerValues(userArray) {
  var returnString = "";
  userArray.forEach((user, index, answers) => {
    var isLastOption = answers.length - 1 == index;
    var queryString = `(
      N'${user.Name ? user.Name.replace(/'/g, "''") : null}',
        '${user.UserName}',
        '${user.Password}',
        '${user.DOB}',
        N'${user.Institution.replace(/'/g, "''")}',
        'STUDENT',
        N'${user.Email.replace(/'/g, "''")}',
        N'${user.City.replace(/'/g, "''")}',
        '${user.Phone}',
        '${user.QuizCategory}',
        '${user.Age}',
        '0'
        )`;
    returnString += `${queryString}${isLastOption ? "" : ","}`;
  });
  return returnString;
}

exports.UserController = {
  getUsers: getUsers,
  getUser: getUser,
  postDetails: postDetails,
};
