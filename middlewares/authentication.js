const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName){
    return (req, res, next)=>{
        const tokenCookieValue = req.cookies[cookieName];
        // if there is no user signed in, next function will be called
        if(!tokenCookieValue){
            return next();
        }
        try{
        // if there is a token, we will validate it and attach the user object to the request object
        const userPayLoad = validateToken(tokenCookieValue);
        req.user = userPayLoad;
        }
        catch(err){
        }
        return next();
    }
}

module.exports = {
    checkForAuthenticationCookie,
}
