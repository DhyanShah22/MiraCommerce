const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    Stock: {
        type: Number,
        required: true
    },
    SellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EcomUser',
        required: true 
    }
}, {timestamps: true})

module.exports = mongoose.model('EcomProduct', productSchema)