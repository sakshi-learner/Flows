const router = require('express').Router();
const FlowController = require('../controllers/flow.controller');
const auth = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/', FlowController.list);
router.get('/:id', FlowController.get);
router.post('/', FlowController.create);
router.put('/:id', FlowController.update);
router.post('/:id/default', FlowController.setDefault);

module.exports = router;
