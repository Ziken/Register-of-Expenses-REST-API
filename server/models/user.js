const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
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

UserSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({_id: this._id.toHexString(), access: 'auth'}, 'verysecrettoken').toString();

    this.tokens.push({access: 'auth', token});
    return this.save().then(() => token);
};

UserSchema.methods.removeToken = function (token) {
    return this.update({
        '$pull': {
            'tokens': {
                'token': token
            }
        }
    });
};

UserSchema.methods.toJSON = function() {
    const userObject = this.toObject();

    return _.pick(userObject, ['_id', 'email'])
};

UserSchema.statics.findByToken = function(token) {
    let user;
    try {
        user = jwt.verify(token, 'verysecrettoken');
    } catch (e) {
        return Promise.reject('');
    }

    return this.findOne({
        _id: user._id,
        'tokens.access': 'auth',
        'tokens.token': token
    });
};
UserSchema.statics.authByCredentials = function(email, password) {
    return this.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject('');
        }

        return bcrypt.compare(password, user.password).then((isValid) => {
            if (isValid) {
                return Promise.resolve(user)
            }
            return Promise.reject('');
        });
    })
};

UserSchema.pre('save', function(next) {
    if (this.isModified('password')) {
        const user = this;

        bcrypt.genSalt(10).then((salt) => {
            return bcrypt.hash(user.password, salt)
        }).then((hash) => {
            user.password = hash;
            next();
        }).catch((err) => {
            next(err);
        });
    } else {
        next();
    }
});
const User = mongoose.model('User', UserSchema);

module.exports = {
    User
};