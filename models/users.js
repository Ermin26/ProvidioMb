const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passport = require('passport-local-mongoose');

const PeopleSchema = new Schema({
    name: String,
    password: String,
    role: {
        type: String,
        enum: ['admin', 'moderator', 'visitor']
    }
});

PeopleSchema.plugin(passport);

module.exports = mongoose.model('People', PeopleSchema);