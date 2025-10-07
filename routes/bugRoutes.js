const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const bugController = require('../controllers/bugControllers');
const {
  validate,
  bugSchema,
  querySchema
} = require('../middleware/validation');

// ✅ Protect all routes
router.use(authMiddleware);

// Bug routes
router.get('/', validate(querySchema, 'query'), bugController.getAllBugs);
router.post('/', validate(bugSchema), bugController.addBug);
router.delete(
  '/delete-all',
  validate(querySchema, 'query'),
  bugController.deleteAllBugs
);
router.patch('/:id', validate(bugSchema), bugController.updateBug);
router.delete('/:id', bugController.deleteBug);
router.get(
  '/summary',
  validate(querySchema, 'query'),
  bugController.getBugSummary
);

module.exports = router;
