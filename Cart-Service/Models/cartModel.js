const mongoose = require('mongoose')

const Schema = mongoose.Schema

const cartSchema = new Schema({
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
        }
    }]
}, {timestamps: true})

module.exports = mongoose.model('Cart', cartSchema)