var path = require("path");
var multer = require("multer");
var fs = require("fs");
var uploadDirectory = "./Images";

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory);
    }
    callback(null, uploadDirectory);
  },
  filename: function (req, file, callback) {
    callback(null, `${Date.now()}_${file.originalname}`);
  },
});
var fileFilter = function (req, file, callback) {
  if (
    path.extname(file.originalname).toLowerCase() === ".png" ||
    path.extname(file.originalname).toLowerCase() === ".jpg"
  ) {
    console.log(file);
    callback(null, true);
  } else {
    callback(null, false);
  }
};

var imageUpload = (req, res) => {
  try {
    if (
      path.extname(req.file.originalname).toLowerCase() === ".png" ||
      path.extname(req.file.originalname).toLowerCase() === ".jpg"
    ) {
      res.status(200).send(req.file);
    }
  } catch (err) {
    res.status(400).send("Not Allowed !!!");
  }
};

exports.ImageUpload = {
  imageUpload: imageUpload,
  fileFilter: fileFilter,
  storage: Storage,
};
