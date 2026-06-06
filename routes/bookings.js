const router = require('express').Router();
const { list, detail, create, update, updateStatus, remove } = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, list);
router.get('/:id', authenticate, detail);
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.patch('/:id/status', authenticate, authorize('admin'), updateStatus);
router.delete('/:id', authenticate, remove);

module.exports = router;