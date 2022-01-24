const { productsController } = require('../controllers');

const router = require('express').Router();

router.get('/',productsController.getProducts)
router.post('/add-product',productsController.addProduct)

module.exports = router
