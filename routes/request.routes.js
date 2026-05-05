const express = require('express');
const requestController = require('../controllers/request.controller');
const { authenticate, authorize, requireVerifiedInstitution } = require('../middlewares/auth');
const requestValidator = require('../validators/request.validator');

const router = express.Router();

//---------------------institutions are allowed to create requests after being verified by an admin.--------------------//

// All request routes require authentication
router.use(authenticate);

// Statistics route MUST be defined before /:id to avoid being matched as an id
router.get('/statistics',authorize('institution','admin', 'superadmin'),requireVerifiedInstitution,requestController.getStats);

// Matches for a specific request
router.get(
  '/:id/matches',
  authorize('institution','admin', 'superadmin'),
  requireVerifiedInstitution,
  requestValidator.idParam,
  requestController.getMatches
);

router
  .route('/')
  .post(authorize('institution'), requireVerifiedInstitution, requestValidator.create, requestController.create)
  .get(authorize('institution','admin', 'superadmin'),requireVerifiedInstitution,requestController.getAll);

router
  .route('/:id')
  .get(authorize('institution', 'admin', 'superadmin'),requireVerifiedInstitution,requestValidator.idParam, requestController.getOne)
  .patch(authorize('institution'), requireVerifiedInstitution, requestValidator.update, requestController.update)
  .delete(authorize('institution'),requireVerifiedInstitution ,requestValidator.idParam, requestController.delete);

module.exports = router;
