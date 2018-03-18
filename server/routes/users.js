const express = require('express');

const {authenticate} = require('./../middleware/authenticate');
const {newErr} = require('./../middleware/handleError');
const {User} = require('./../models/user');


const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const user = new User({email, password});

        const insertedUser = await user.save();
        const token = await user.generateAuthToken();

        res.header('x-auth', token).send({
            result: insertedUser
        })
    } catch (err) {
        next(newErr(400, 'unable to insert user'));
    }
});

router.get('/me', authenticate, async (req, res, next) => {
    try {
        res.header('x-auth', req.token).send({result: req.user});
    } catch (err) {
        next(newErr(401, 'Cannot authenticate user'))
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const user = await User.authByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send({result: user});

    } catch (err) {
        next(newErr(401, 'invalid credentials'))
    }
});

router.post('/logout', authenticate, async (req, res, next) => {
    try {
        await req.user.removeToken(req.token);
        res.send();
    } catch (err) {
        next(newErr(400, 'cannot log out'));
    }

});



module.exports = router;