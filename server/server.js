require('./config/config');
const express = require('express');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const mongoose = require('./db/mongoose');
const {Expense} = require('./models/expense');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();
const PORT = process.env.PORT;

app.use(require('body-parser').json());

app.post('/expenses', authenticate, (req, res) => {
    const {title, amount, spentAt} = req.body;
    const expense = new Expense({title, amount, spentAt, _creator: req.user._id});

    expense.save().then((result) => {
        res.send({result});
    }).catch((err) => {
        res.status(400).send();
    });
});


app.get('/expenses',authenticate ,(req, res) => {
    const id = req.user._id;
    Expense.find({_creator: id}).then((result) => {
        res.send({result});
    }).catch((err) => {
        res.status(400).send();
    });
});

app.get('/expenses/:id', authenticate, (req,res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }

    Expense.findOne({
        _id: id,
        _creator: req.user._id
    }).then((result) => {
        if (!result) {
            return res.status(404).send();
        }
        res.send({result});
    }).catch(() => {
        res.status(404).send();
    });
});

app.patch('/expenses/:id', authenticate,(req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }
    const body = _.pick(req.body, 'title', 'amount', 'spentAt');

    Expense.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, {
        $set: body
    }, {
        new: true
    }).then((result) => {
        if (!result) {
            return res.status(404).send();
        }

        res.send({result});
    }).catch(() => {
        res.status(400).send();
    });
});

app.delete('/expenses/:id', authenticate, (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }

    Expense.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((result) => {
        if (!result) {
            return res.status(404).send();
        }

        res.send({result});
    }).catch(() => {
        res.status(400).send();
    });
});

//=========
//  USER
//=========
app.post('/users', (req,res) => {
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

app.get('/users/me', authenticate, (req, res) => {
    res.header('x-auth', req.token).send({result: req.user});
});

app.post('/users/login', (req,res) => {
    const {email, password} = req.body;

    User.authByCredentials(email, password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send({result: user});
        });
    }).catch(() => {
        res.status(401).send();
    });
});

app.post('/users/logout', authenticate, (req, res) => {

    req.user.removeToken(req.token).then(() => {
        res.send();
    }).catch(() => {
        res.send(400).send();
    });

});


app.listen(PORT, () => {
    console.log(`Application is running on port ${PORT}`);
});

module.exports = {
    app
};