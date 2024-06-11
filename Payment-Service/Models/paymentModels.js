const mongoose = require('mongoose')

const Schema = mongoose.Schema

const paymentSchema = new Schema({
    OrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EcomOrder',
        required:  true
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EcomUser',
        required: true
    },
    Amount: {
        type: Number,
        required: true
    },
    Status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    StripeId: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('EcomPayment', paymentSchema)