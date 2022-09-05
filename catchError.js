const People = require('./models/users');
const ExpressError = require('./utils/ExpressError');




module.exports.isLoged = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in')
        return res.redirect('/login')
    }
    next();
};