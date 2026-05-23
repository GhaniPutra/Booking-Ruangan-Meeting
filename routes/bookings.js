const router = require('express').Router();
const { list, detail, create, update, remove } = require('../controllers/bookingController');
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, list);
router.get('/:id', authenticate, detail);
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

module.exports = router;