module.exports.loged = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', "You must be logged in to make changes. If your role is VISITOR you can only see data in our database.");
        res.redirect('/employeesLogIn');
    } else {

        next();
    }
}
