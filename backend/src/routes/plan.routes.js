const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan.controller');
const auth = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/admin.middleware');

router.post('/', auth, adminOnly, planController.createPlan);
router.put('/:id', auth, adminOnly, planController.updatePlan);
router.delete('/:id', auth, adminOnly, planController.deletePlan);

router.get('/', planController.getPlans); // public

module.exports = router;
