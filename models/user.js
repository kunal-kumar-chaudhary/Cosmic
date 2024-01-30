// user database schema
const { Schema, model } = require('mongoose');
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../services/authentication");
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password:{
        type: String,
        required: true,
    },
    profileImageURL:{
        type: String,
        default: "/images/default.jpg"
    }
}, {timestamps: true});

// pre-save hook to hash the password before saving it to the database
userSchema.pre("save", function(next){
    const user = this;

    // If the password field is already present, we will proceed with the hashing logic
    if(!user.isModified("password")) return;

    const salt = randomBytes(32).toString();
    const hashedPassword = createHmac("sha256", salt).update(user.password).digest("hex");
    
    this.salt = salt;
    this.password = hashedPassword;
    next();
})

// we will call this method later to create token and store it in a cookie for authentication purpose
userSchema.static("matchPasswordAndGenerateToken", async function(email, password){
    const user = await this.findOne({email});

    // if there is no user with the given user, we will throw an error
    if(!user) {
        throw new Error("User not found");
    }

    // if there is user, we will match the hashes stored and whatever the user has input
    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt).update(password).digest("hex");

    if (userProvidedHash !== hashedPassword){
        throw new Error("Password didn't match");
    }

    // if the password matches, this function will return a token for the user
    const token = createTokenForUser(user);
    return token;

})

const User = model("User", userSchema);

module.exports = User;