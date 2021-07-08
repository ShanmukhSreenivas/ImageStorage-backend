const mongoose = require('mongoose')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
      },
    email: {
        type: String,
        required: [true, "Enter a username"],
        trim: true,
        index: true, 
        unique: true, 
        sparse: true
    },
    password: {
        type: String,
        required: [true, "Enter a password"],
        minlength: [6, "Password should be atleast minimum of 6 characters"],
        validate(value) {
          if (value.length < 6) {
            throw new Error('Password should be atleast minimum of 6 characters');
          }
        },
      },
})

userSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  };

userSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

module.exports = mongoose.model('User',userSchema)