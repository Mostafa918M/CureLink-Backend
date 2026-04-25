const express = require('express');
const router = express.Router();
const searchController=require("../controllers/search.controller");
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, authorize('institution','admin','superadmin') , searchController.getAll);  //search about all approved donations for institution

module.exports = router;
