const mongoose = require('mongoose')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
    email: {
        type: String,
        required: [true, "Enter a username"],
        unique: true, 
    },
    password: {
        type: String,
        required: false,
        minlength: [6, "Password should be atleast minimum of 6 characters"],
        validate(value) {
          if (value.length < 6) {
            throw new Error('Password should be atleast minimum of 6 characters');
          }
        },
      },
    social: {
        facebookProvider: {
            id: String,
            token: String,
        },
        googleProvider: {
            id: String,
            token: String
        }
    }
})

/* userSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
 */
userSchema.methods.getJwtToken = function () {
    return jwt.sign({email: this.email, userId: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  };

userSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };


userSchema.statics.upsertFbUser = async function ({ accessToken, refreshToken, profile }) {
    const User = this;

    const user = await User.findOne({ 'social.facebookProvider.id': profile.id });

    // no user was found, lets create a new one
    if (!user) {
        const newUser = await new User({
            name: profile.displayName || `${profile.familyName} ${profile.givenName}`,
            email: profile.emails[0].value,
            'social.facebookProvider': {
                id: profile.id,
                token: accessToken,
            },
        });
        newUser.save()
        return newUser;
    }
    return user;
};

userSchema.statics.upsertGoogleUser = async function ({ accessToken, refreshToken, profile }) {
    const User = this;

    const user = await User.findOne({ 'social.googleProvider.id': profile.id });

    // no user was found, lets create a new one
    if (!user) {
        const newUser = await new User({
            name: profile.displayName || `${profile.familyName} ${profile.givenName}`,
            email: profile.emails[0].value,
            'social.googleProvider': {
                id: profile.id,
                token: accessToken,
            },
        });
        newUser.save()
        return newUser;
    }
    return user;
};

module.exports = mongoose.model('User',userSchema)