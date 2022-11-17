const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');



const PeopleSchema = new Schema({
    username: String,
    password: String,
    role: {
        type: String,
        enum: ['admin', 'moderator', 'visitor', 'employer']
    }
});

PeopleSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('People', PeopleSchema);