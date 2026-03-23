const express = require('express');
const requestController = require('../controllers/request.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const requestValidator = require('../validators/request.validator');

const router = express.Router();

// All request routes require authentication
router.use(authenticate);

// Statistics route MUST be defined before /:id to avoid being matched as an id
router.get('/statistics', requestController.getStats);

// Matches for a specific request
router.get(
  '/:id/matches',
  requestValidator.idParam,
  authorize('institution', 'admin', 'superadmin'),
  requestController.getMatches
);

router
  .route('/')
  .post(authorize('institution'), requestValidator.create, requestController.create)
  .get(authorize('institution', 'admin', 'superadmin'), requestController.getAll);

router
  .route('/:id')
  .get(requestValidator.idParam, requestController.getOne)
  .patch(authorize('institution'), requestValidator.update, requestController.update)
  .delete(authorize('institution'), requestValidator.idParam, requestController.delete);

module.exports = router;
