const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');



const PeopleSchema = new Schema({
    name: String,
    password: String,
    role: {
        type: String,
        enum: ['admin', 'moderator', 'visitor']
    }
});

PeopleSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('People', PeopleSchema);