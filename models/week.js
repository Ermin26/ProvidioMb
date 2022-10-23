const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const WeekSchema = new Schema({
    week: {
        type: Number,
        default: 42
    },
    year: {
        type: Number,
        default: 2022
    }
});


module.exports = mongoose.model('Week', WeekSchema);