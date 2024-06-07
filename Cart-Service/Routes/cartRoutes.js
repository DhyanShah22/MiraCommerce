const express = require('express');
const { getCart, addToCart, removeFromCart, clearCart } = require('../Controllers/cartController');
const { authenticate, authorize } = require('../Middleware/auth');
const router = express.Router();

router.get('/', authenticate, authorize(['customer']), getCart); // Only customers should have a cart
router.post('/', authenticate, authorize(['customer']), addToCart);
router.delete('/:productId', authenticate, authorize(['customer']), removeFromCart);
router.delete('/', authenticate, authorize(['customer']), clearCart);

module.exports = router;
