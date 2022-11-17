const Employers = require('../models/employees');
const passport = require('passport');

module.exports.loged = async (req, res, next) => {
    req.flash('success', 'Welcome! You have successfully logged in');
    const redirectUrl = '/userCheckByHimself';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
    next();
};