const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const NotificationsSchema = new Schema({
    username: String,
    lastname: String,
    status: {
        type: String,
        default: 'false',
    }
});


module.exports = mongoose.model('Notifications', NotificationsSchema)