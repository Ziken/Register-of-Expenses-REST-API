const express = require('express');

const {authenticate} = require('./../middleware/authenticate');
const {User} = require('./../models/user');

const router = express.Router();

router.post('/', (req,res) => {
    const {email, password} = req.body;
    const user = new User({email, password});

    user.save().then(() => {
        return  user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send({result: user});
    }).catch((err) => {
        res.status(400).send(err);
    });
});

router.get('/me', authenticate, (req, res) => {
    res.header('x-auth', req.token).send({result: req.user});
});

router.post('/login', (req,res) => {
    const {email, password} = req.body;

    User.authByCredentials(email, password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send({result: user});
        });
    }).catch(() => {
        res.status(401).send('invalid credentials');
    });
});

router.post('/logout', authenticate, (req, res) => {

    req.user.removeToken(req.token).then(() => {
        res.send();
    }).catch(() => {
        res.send(400).send('cannot logout');
    });

});



module.exports = router;