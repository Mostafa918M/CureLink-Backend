const multer = require('multer');
const apiError = require('../utils/apiError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); 
  } else {
    cb(new apiError('file type not supported. please upload images only.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});

exports.uploadDonationImages = upload.array('images', 5);
