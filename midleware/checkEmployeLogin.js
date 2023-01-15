module.exports.loged = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        
        req.flash('error', "You must be logged in to see data.");
        res.redirect('/employee');
    } else {

        next();
    }
}
