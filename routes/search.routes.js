const express = require('express');
const router = express.Router();
const searchController=require("../controllers/search.controller");
const { authenticate, authorize, requireVerifiedInstitution } = require('../middlewares/auth');

//search for only verified institutions
router.get('/', authenticate, authorize('institution','admin','superadmin') , requireVerifiedInstitution ,searchController.getAll);  //search about all approved donations for institution

module.exports = router;
