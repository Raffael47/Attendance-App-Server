const router = require('express').Router();
const { attendanceController } = require('../controllers')
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, attendanceController.clockIn);
router.patch('/', verifyToken, attendanceController.clockOut);
router.get('/', verifyToken, attendanceController.getUserRecord);

module.exports = router;