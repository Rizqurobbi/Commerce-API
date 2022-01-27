const router = require('express').Router();
const { readToken } = require('../config/encrip');
const { productsController } = require('../controllers');


router.get('/brand',productsController.getBrand)
router.get('/category',productsController.getCategory)

router.get('/',productsController.getProducts)

// hanya admin yang bisa melakukan request tersebut
router.post('/',readToken,productsController.addProduct)
router.delete('/:id',readToken,productsController.deleteProduct)
router.patch('/:id',readToken,productsController.editProduct)

module.exports = router
