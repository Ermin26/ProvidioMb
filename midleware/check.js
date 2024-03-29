module.exports.isLoged = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', "You must be logged in to make changes. If your role is VISITOR you can only see data in our database.");
        res.redirect('/login');
    } else {

        next();
    }
}