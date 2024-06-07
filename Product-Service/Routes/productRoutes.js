const express = require('express');

const {
    getProduct,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../Controllers/productController')

const {
    authenticate,
    authorize
} = require('../Middleware/auth')

const router = express.Router();

router.get('/', getProduct);
router.get('/:id', getProductById);
router.post('/', authenticate, authorize(['seller']), createProduct); // Only sellers can create products
router.patch('/:id', authenticate, authorize(['seller']), updateProduct); // Only the owner seller can update
router.delete('/:id', authenticate, authorize(['seller']), deleteProduct); // Only the owner seller can delete

module.exports = router;
