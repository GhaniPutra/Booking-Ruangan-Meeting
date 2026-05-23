const router = require('express').Router();
const { me } = require('../controllers/meController');
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, me);

module.exports = router;