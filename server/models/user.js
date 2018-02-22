const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 2,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email!'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = {
    User
};