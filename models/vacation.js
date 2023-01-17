const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PendingSchema = new Schema({
    startDate: [{
        type: String
    }],
    endDate: [{ type: String }],
    days: [{ type: Number }],
    status: [{
        type: String,
        default: '/',
        enum: ['Pending', 'Approved', 'Rejected', 'Ended', '/']
    }]
})

const VacationSchema = new Schema({
    user: String,
    lastYearHolidays: Number,
    holidays: Number,
    usedHolidays: Number,
    pendingHolidays: [PendingSchema]
})


module.exports = mongoose.model('Vacation', VacationSchema)