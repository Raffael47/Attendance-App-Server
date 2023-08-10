const router = require('express').Router();
const { userController } = require('../controllers');
const { multerUpload } = require('../middleware/MULTER.JS');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { checkEmail, checkEmailExist, checkPassword, checkConfirmPassword, checkUsername } = require('../middleware/authValidator');

router.patch('/email', verifyToken, checkEmail, checkEmailExist, userController.editEmail);
router.patch('/name', verifyToken, checkUsername, userController.editName );
router.patch('/password', verifyToken, checkPassword, checkConfirmPassword, userController.changePassword);
router.patch('/reset', verifyToken, checkPassword, checkConfirmPassword, userController.resetPassword);
router.patch('/salary', verifyToken, verifyAdmin, userController.editShiftSalary);
router.post('/', verifyToken, multerUpload('./public', 'PIMG').single('file'), userController.uploadProfilePic);
router.get('/', verifyToken, verifyAdmin, userController.getAllUser);
router.get('/shift', verifyToken, userController.getShift);

module.exports = router;