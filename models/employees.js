const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const EmployersSchema = new Schema({
    username: String,
    password: String,
    lastname: String
});

EmployersSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Employers', EmployersSchema)