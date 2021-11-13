var path = require("path");
var multer = require("multer");
var fs = require("fs");
var uploadDirectory = "./Images";
var isImageFile = () => {
  return (
    path.extname(req.file.originalname).toLowerCase() === ".png" ||
    path.extname(req.file.originalname).toLowerCase() === ".jpg"
  );
};
var storage = multer.diskStorage({
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
  if (isImageFile()) {
    console.log(file);
    callback(null, true);
  } else {
    callback(null, false);
  }
};

var upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

var imageUpload = (req, res) => {
  try {
    if (isImageFile()) {
      res.status(200).send(req.file);
    }
  } catch (err) {
    res.status(400).send("Not Allowed !!!");
  }
};

exports.ImageUploadController = {
  imageUpload: imageUpload,
  upload: upload,
};
