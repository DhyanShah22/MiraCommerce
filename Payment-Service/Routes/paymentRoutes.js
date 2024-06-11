const express = require('express');
const { createPayment, handleWebhook } = require('../Controllers/paymentController');
const {
    authenticate
}= require('../Middleware/auth');
const router = express.Router();

router.post('/create', authenticate, createPayment);
router.post('/webhook', handleWebhook);

module.exports = router;
    