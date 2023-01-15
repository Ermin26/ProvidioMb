const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const VacationSchema = new Schema({
    user: String,
    startDate: String,
    endDate: String,
    days: Number,
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Approved', 'Rejected']
    }
})


module.exports = mongoose.model('Vacation', VacationSchema)