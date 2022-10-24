const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const WeekSchema = new Schema({
    week: {
        type: Number,
        default: 44
    },
    year: {
        type: Number,
        default: 2022
    },
    minusWeek: {
        type: Number,
        default: 44
    }
});


module.exports = mongoose.model('Week', WeekSchema);