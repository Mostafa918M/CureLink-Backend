const multer = require('multer');
const ApiError = require('../utils/apiError');

const memoryStorage = multer.memoryStorage();

// for logo
const imageOnlyFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new ApiError('Only image files are allowed (JPG, PNG, WEBP)', 400), false)
  }
};

//for institution documents
const documentFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp' ,'application/pdf']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ApiError('Only images (JPG, PNG, WEBP) and PDF files are allowed', 400), false)
  }
};

const uploadLogo = multer({
  storage: memoryStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
})

const uploadDocuments = multer({
  storage: memoryStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
})

exports.uploadInstitutionLogo = uploadLogo.single('logo');
exports.uploadInstitutionDocuments = uploadDocuments.fields([
  { name: 'commercial_register',     maxCount: 1 },
  { name: 'tax_card',                maxCount: 1 },
  { name: 'licenseNumber',           maxCount: 1 },
  { name: 'founding_decision',       maxCount: 1 },  
  { name: 'association_registration',maxCount: 1 },
  { name: 'other',               maxCount: 3 },
]);