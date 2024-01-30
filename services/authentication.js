const JWT = require("jsonwebtoken");
const secret = "MummyPapa@12345";

const createTokenForUser = (user) => {
    const payload = {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        profileImageURL: user.profileImageURL,
    }
    
    const token = JWT.sign(payload, secret, {expiresIn: "1d"});
    return token;
}

// it takes a token and return the user object is the token was valid
const validateToken = (token) => {
    // if the token is not valid, it will not return any user
    try{
    const user = JWT.verify(token, secret);
    return user;
    }
    catch(err){
        return null;
    }
}

module.exports = {
    createTokenForUser,
    validateToken,
}