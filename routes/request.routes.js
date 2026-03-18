const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const requestValidator = require('../validators/request.validator');


router.get('/', requestController.getAll);
router.get('/:id', requestController.getOne);
router.post('/', requestValidator.create, requestController.create);
router.put('/:id', requestValidator.update, requestController.update);
router.delete('/:id', requestController.delete);

module.exports = router;
