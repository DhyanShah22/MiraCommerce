const Cart = require('../Models/cartModel')
const logger = require('../Logger/logger')
const Product = require('../Models/productModels')

const {
    getCache,
    setCache
} = require('../Services/redisService')

const getCart = async (req,res) => {
    const UserId = req.user._id

    try {
        logger.info('Fetching Users..')
        const cachedCarts = await getCache('carts')
        if(cachedCarts) {
            logger.info('Cached Users!!')
            logger.info(cachedCarts)
            const parsedUsers = JSON.parse(cachedCarts);
            logger.info(parsedUsers)
            return res.status(201).json(parsedUsers)
        }

        logger.info('Fetching Cart from Database!!')
        const cart = await Cart.findOne({ UserId }).populate('items.ProductId');
        if (!cart) {
            logger.error('Cart not available')
            return res.status(404).json({ message: 'Cart not found' });
        }
        logger.info('Caching Carts....')
        await setCache('carts', cart)
        logger.info(cart)
        return res.status(200).json(cart);
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Server error', error });
    }
}

const addToCart = async (req, res) => {
    const UserId = req.user._id; // Get the authenticated user's ID
    const { ProductId, Quantity } = req.body;

    try {
        let cart = await Cart.findOne({ UserId });
        if (!cart) {
            logger.info('Creating a new cart!')
            cart = new Cart({ UserId, items: [] });
        }
        logger.info('Checking item index!!')
        const itemIndex = cart.items.findIndex(item => item.ProductId.toString() === ProductId);
        if (itemIndex > -1) {
            logger.info('Adding quantity!!')
            cart.items[itemIndex].Quantity += Quantity;
        } else {
            logger.info('Cart created!')
            cart.items.push({ ProductId, Quantity });
        }

        await cart.save();
        logger.info('Product added to cart')
        res.status(200).json({ message: 'Product added to cart', cart });
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Server error', error });
    }
};


const removeFromCart = async (req, res) => {
    const UserId = req.user._id; // Get the authenticated user's ID
    const { ProductId } = req.params;

    try {
        const cart = await Cart.findOne({ UserId });
        if (!cart) {
            logger.info('Cart not found')
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.ProductId.toString() !== ProductId);
        await cart.save();
        logger.info('Product removed from cart')
        res.status(200).json({ message: 'Product removed from cart', cart });
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Server error', error });
    }
};

const clearCart = async (req, res) => {
    const UserId = req.user._id; // Get the authenticated user's ID

    try {
        const cart = await Cart.findOne({ UserId });
        if (!cart) {
            logger.info('Cannot find the cart!')
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        await cart.save();
        logger.info('Cart Cleared!!')
        res.status(200).json({ message: 'Cart cleared', cart });
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };