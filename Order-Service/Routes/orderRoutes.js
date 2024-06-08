const express = require('express');
const { createOrder, getOrders, updateOrderStatus } = require('../Controllers/orderControllers');
const { authenticate, authorize } = require('../Middleware/auth');
const router = express.Router();

router.get('/', authenticate, authorize(['customer']), getOrders); // Only customers can view their orders
router.post('/', authenticate, authorize(['customer']), createOrder); // Only customers can create orders
router.patch('/:id/status', authenticate, authorize(['seller']), updateOrderStatus); // Only sellers can update the order status

module.exports = router;
