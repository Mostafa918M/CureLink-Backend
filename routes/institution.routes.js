const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institution.controller');
const institutionValidator = require('../validators/institution.validator');
const { authenticate, authorize } = require('../middlewares/auth');
const { uploadInstitutionDocuments, uploadInstitutionLogo } = require('../middlewares/multer');


router.post('/register',authenticate,authorize("institution"),uploadInstitutionLogo,institutionValidator.register, institutionController.register);  //institution registeration if user role==institution 
router.get('/profile',authenticate ,authorize("institution","admin","superadmin"),institutionController.getProfile);    //get own intitution profile
router.put('/profile',authenticate ,authorize("institution"),uploadInstitutionLogo,institutionValidator.updateProfile, institutionController.updateProfile);  //update institution profile
router.get('/', institutionController.getAllInstitutions);       //get only verified institution for public 
  
router.post("/documents",authenticate,authorize("institution"),uploadInstitutionDocuments,institutionController.postDocuments)     //upload verification documents 
router.get("/documents",authenticate,authorize("institution","admin","superadmin"),institutionController.getDocuments)      //get institution documents

router.get('/:id',institutionValidator.getOneInstitution , institutionController.getOneInstitution);     //get institution details for public

router.get("/stats")

module.exports = router;
