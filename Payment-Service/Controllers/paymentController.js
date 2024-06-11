const Stripe = require('stripe')
require('dotenv').config()

const { stripeSecretKey} = process.env.STRIPE_SECRET_KEY
const Payment = require('../Models/paymentModels')
const Order = require('../Models/orderModels')
const logger = require('../Logger/logger')

const stripe = new Stripe(stripeSecretKey)

const createPayment = async(req, res) => {
    logger.info('Fetching OrderId and Amount from req.body')
    const {OrderId, Amount} = req.body 
    logger.info(OrderId, Amount)
    logger.info('Logging User Id..')
    const UserId= req.user._id
    logger.info(UserId)

    try{
        logger.info('Finding Order by ID')
        const order = await Order.findById(OrderId)
        logger.info(order)
        if(!order || order.UserId.toString() !== UserId){
            logger.error('No such Order found!')
            return res.status(404).json({message: 'Order Not Found..'})
        }

        logger.info('Payment Intent')
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Amount * 100,
            currency: 'usd',
            metadata: {
                OrderId: order._id.toString(),
                UserId: UserId.toString()
            }
        })
        const payment = new Payment({
            OrderId,
            UserId,
            Amount,
            StripeId: paymentIntent.id,
            Status: 'Pending'
        })

        await payment.save()
        logger.info('Payment info saved')

        res.status(201).json({
            message: 'Payment initiated',
            clientSecret: paymentIntent.client_secret,
            payment
        });
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Server error', error });
    }
}

const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = 'your-webhook-secret'; // Set this in your Stripe dashboard
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const payment = await Payment.findOne({ StripeId: paymentIntent.id });

        if (payment) {
            payment.Status = 'Completed';
            await payment.save();

            const order = await Order.findById(payment.OrderId);
            if (order) {
                order.status = 'Completed';
                await order.save();
            }
        }
    }
    res.json({ received: true });
};

module.exports = { createPayment, handleWebhook };