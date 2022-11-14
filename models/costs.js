const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const CostsSchema = new Schema({
    date: String,
    buyedProducts: [{
        type: String
    }],
    totalPrice: Number,
    bookedDate: String,
    bookedUser: String
})

module.exports = mongoose.model('Costs', CostsSchema)