const router = require('express').Router();
const { list, detail, create, update, remove } = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, authorize('admin'), list);
router.get('/:id', authenticate, authorize('admin'), detail);
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;