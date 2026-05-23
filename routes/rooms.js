const router = require('express').Router();
const { list, detail, create, update, remove } = require('../controllers/roomController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, list);                     // semua role bisa lihat
router.get('/:id', authenticate, detail);                // semua role bisa lihat detail
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;