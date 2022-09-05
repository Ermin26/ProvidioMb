const People = require('../models/users');
const passport = require('passport');


module.exports.logIn = async (req, res, next) => {
    req.flash('success', 'Welcome! You have successfully logged in');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logOut = async (req, res, next) => {
    req.logout();
    req.flash('success', 'Goodbye');
    res.redirect('/')
};