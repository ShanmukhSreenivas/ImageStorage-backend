const jwt = require('jsonwebtoken')
require('dotenv').config();

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization/* get('Authorization') */;
    if(!authHeader){
        req.body.isAuth = false;
        return  next(); 
    }
    const token = authHeader.split(' ')[1];
    if(!token || token === ""){
        req.body.isAuth = false;
        return  next(); 
    }
    let decodedToken;
    try{
        decodedToken = jwt.verify(token,process.env.JWT_SECRET);
    }catch(error){
        req.body.isAuth = false;
        return  next(); 
    }
    if(!decodedToken){
        req.body.isAuth = false;
        return  next();
    }
    req.body.isAuth = true;
    req.body.userId = decodedToken.userId;
    next();
} 


