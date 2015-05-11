var express = require('express');
var router = express.Router();

router.use('', require('./types'));
router.use('/admin', require('./admin'));

module.exports = router;