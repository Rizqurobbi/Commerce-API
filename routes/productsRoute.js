const { productsController } = require('../controllers');

const router = require('express').Router();

router.get('/',productsController.getProducts)
router.post('/',productsController.addProduct)

module.exports = router
