const Order = require('../Models/orderModels')
const Product = require('../Models/productModels')

const logger = require('../Logger/logger')

const createOrder = async(req, res) => {
    const UserId = req.user._id
    const {items} = req.body

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
        res.status(201).json({ message: 'Order created', order });
    }
    catch(error) {
        res.status(500).json({ message: 'Server error', error });
        logger.error(error)
    }
}

const getOrders = async (req, res) => {
    const UserId = req.user._id; // Get the authenticated user's ID

    try {
        logger.info('Finding Information..')
        const orders = await Order.find({ UserId }).populate('items.ProductId');
        if (!orders) {
            logger.error('Cannot find Order..')
            return res.status(404).json({ message: 'Orders not found' });
        }
        res.status(200).json(orders);
        logger.info(orders)
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