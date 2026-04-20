const express = require('express');
const router = express.Router();
const adminInstitutionController = require('../controllers/admin.institution.controller');
const { authenticate, authorize } = require('../middlewares/auth');


router.use(authenticate, authorize("superadmin" ,"admin"));

router.get('/', adminInstitutionController.getAllInstitutions);
router.get('/pending', adminInstitutionController.getPendingInstitutions);
router.get('/:id', adminInstitutionController.getInstitutionDetails);
router.patch('/:id/verify', adminInstitutionController.verifyInstitution);
router.patch('/:id/reject', adminInstitutionController.rejectInstitution);

module.exports = router;
