const Order = require('../Models/orderModels')
const Product = require('../Models/productModels')
const axios = require('axios');
const logger = require('../Logger/logger')
const {
    getCache,
    setCache
} = require('../Services/redisService')

const initiatePayment = async (order, userToken) => {
    const paymentData = {
        OrderId: order._id,
        Amount: order.totalPrice,
    };

    if (!userToken) {
        logger.error('User token is missing')
        throw new Error('User token is missing');
    }

    try { 
    const response = await axios.post('http://localhost:5000/api/payment/create', paymentData, {
        headers: {
            'x-auth-token': userToken,
        },
    });
    return response.data
}
    catch(error){
        logger.error('Payment initiation failed', {
            message: error.message,
            stack: error.stack,
            response: error.response ? error.response.data : null,
        });
        throw new Error('Payment initiation failed');
    }
};

const createOrder = async(req, res) => {
    const UserId = req.user._id
    const {items} = req.body
    const userToken = req.headers['x-auth-token']; 

    try {
        let totalPrice = 0;
        for (const item of items) {
            const product = await Product.findById(item.ProductId)
            if(!product){
                logger.info(`Product with ID ${item.productId} not found`)
                return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
            }
            logger.info('Total Price counting..')
            totalPrice += product.Price * item.Quantity
        }

        const order = new Order({
            UserId,
            items: items.map(item => ({
                ProductId: item.ProductId,
                Quantity: item.Quantity,
                Price: item.Price
            })),
            totalPrice,
            status: 'Pending'
        })

        await order.save()
        logger.info('Order Saved')
        await initiatePayment(order, userToken)
        logger.info('Payment Initiated...')
        res.status(201).json({ message: 'Order created and Payment Initiated', order });
    }
    catch(error) {
        res.status(500).json({ message: 'Server error', error });
        logger.error(error)
    }
}

const getOrders = async (req, res) => {
    const UserId = req.user._id; // Get the authenticated user's ID

    try {
        logger.info('Fetching Orders...')
        const cachedOrders = await getCache('orders')
        if(cachedOrders) {
            logger.info('Returning Cached Orders')
            logger.info(cachedOrders)
            const parsedOrders = JSON.parse(cachedOrders)
            logger.info(parsedOrders)
            return res.status(200).json(parsedOrders)
        }
        logger.info('Finding Orders From Database..')
        const orders = await Order.find({ UserId }).populate('items.ProductId');
        if (!orders) {
            logger.error('Cannot find Order..')
            return res.status(404).json({ message: 'Orders not found' });
        }
        logger.info('Caching Orders..')
        await setCache('orders', orders)
        logger.ingo(orders)
        res.status(200).json(orders);
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 

    try {
        const order = await Order.findById(id);
        if (!order) {
            logger.error('Cannot find Order..')
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        logger.info(status)
        await order.save();
        logger.info('Order Saved')
        res.status(200).json({ message: 'Order status updated', order });
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { createOrder, getOrders, updateOrderStatus };