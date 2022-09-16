module.exports.isLoged = (req,res,next) =>{ 
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
    console.log('error', "You must be logged in to make new bill. If your role is VISITOR you can't make new bill");
   
    res.redirect('/login');
}else{

    next();
}
}

