const router = require('express').Router();
const { payrollController } = require('../controllers');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/', verifyToken, verifyAdmin, payrollController.getAllPayroll);
router.get('/user', verifyToken, payrollController.getUserPayroll);
router.post('/', verifyToken, payrollController.createPayroll);
router.patch('/late', verifyToken, payrollController.lateDeduction);
router.patch('/in', verifyToken, payrollController.noClockIn);
router.patch('/out', verifyToken, payrollController.noClockOut);
router.patch('/accept', verifyToken, payrollController.acceptPayment);
router.patch('/settle', verifyToken, verifyAdmin, payrollController.settlePayment);

module.exports = router;