const router = require('express').Router();
const { authController } = require('../controllers');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { checkUsername, checkEmail, checkPassword, checkEmailExist, checkSalary } = require('../middleware/authValidator');

router.post('/', verifyToken, verifyAdmin, checkUsername, checkEmail, checkEmailExist, checkPassword, checkSalary, authController.addUser);
router.post('/login', checkEmail, checkPassword, authController.login);
router.get('/', verifyToken, authController.keepLogin);
router.put('/', checkEmail, authController.forgotPassword);

module.exports = router;