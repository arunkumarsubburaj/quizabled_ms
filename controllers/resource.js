var multer = require("multer");
var fs = require("fs");
var path = require("path");
var uploadDirectory = "./Resources";
global.appRoot = __dirname;

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory);
    }
    callback(null, uploadDirectory);
  },
  filename: function (req, file, callback) {
    callback(
      null,
      `${Date.now()}_${req.query.fileName.replace(/ /g, "_")}${path.extname(
        file.originalname
      )}`
    );
  },
});
var fileFilter = function (req, file, callback) {
  console.log(file);
  callback(null, true);
};

var upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

var fileUpload = function (req, res) {
  try {
    res.status(200).send(req.file);
  } catch (err) {
    res.status(400).send("Not Allowed !!!");
  }
};

var getListFiles = function (req, res) {
  var directoryPath = appRoot.replace("controllers", "Resources");

  fs.readdir(directoryPath, function (err, files) {
    // res.send(200).send(files);
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }
    var response = [];
    for (let file of files) {
      var extension = path.extname(file);
      response.push({ name: file.split(extension)[0], extension: extension });
    }
    res.status(200).send(response);
  });
};

var download = function (req, res) {
  var fileName = req.query.name;
  var directoryPath = appRoot.replace("controllers", "Resources\\" + fileName);
  if (fs.existsSync(directoryPath)) {
    res.download(directoryPath, fileName, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });
  } else {
    res.end("Resource Not Found");
  }
};
exports.FileUploadController = {
  upload: upload,
  fileUpload: fileUpload,
  download: download,
  getListFiles: getListFiles,
};
