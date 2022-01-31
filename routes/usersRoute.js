const { readToken } = require('../config/encrip');
const { usersController } = require('../controllers');

const router = require('express').Router();

router.get('/',usersController.getData);
router.post('/regis',usersController.register);
router.post('/login',usersController.login);
router.get('/keeplogin',readToken,usersController.keepLogin);
router.get('/verify',readToken,usersController.verification);

module.exports = router