const mongoose = require('mongoose')

const Schema = mongoose.Schema

const orderSchema = new Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EcomUser',
        required: true
    },
    items: [{
        ProductId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EcomProduct',
            required: true
        },
        Quantity: {
            type: Number,
            required: true
        },
        Price: {
            type: Number,
            required: true
        }
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Canceled'],
        default: 'Pending'
    }
})

module.exports = mongoose.model('EcomOrder', orderSchema)