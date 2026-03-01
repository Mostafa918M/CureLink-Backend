const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institution.controller');
const institutionValidator = require('../validators/institution.validator');
const { authenticate } = require('../middlewares/auth');


router.post('/register',authenticate,institutionValidator.register, institutionController.register);  //institution registeration if user role==institution 
router.get('/profile',authenticate ,institutionController.getProfile);    //get own intitution profile
router.put('/profile',authenticate ,institutionValidator.updateProfile, institutionController.updateProfile);  //update institution profile
router.get('/', institutionController.getAllInstitutions);       //get only verified institution for public 
router.get('/:id',institutionValidator.getOneInstitution , institutionController.getOneInstitution);     //get institution details for public
  
router.post("/documents",authenticate,institutionController.postDocuments)     //upload verification documents 
router.get("/documents",authenticate,institutionController.getDocuments)      //get institution documents
router.get("/stats")

module.exports = router;
