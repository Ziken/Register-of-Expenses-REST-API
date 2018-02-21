const express = require('express');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const mongoose = require('./db/mongoose');
const {Expense} = require('./models/expense');

const app = express();

app.use(require('body-parser').json());

app.post('/expenses', (req, res) => {
    const {title, amount, spentAt} = req.body;
    const expense = new Expense({title, amount, spentAt});

    expense.save().then((result) => {
        res.send({result});
    }).catch((err) => {
        res.status(400).send(err);
    });
});


app.get('/expenses', (req, res) => {
    Expense.find().then((result) => {
        res.send({result});
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.get('/expenses/:id', (req,res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }

    Expense.findById(id).then((result) => {
        if (!result) {
            return res.status(404).send();
        }
        res.send({result});
    }).catch(() => {
        res.status(404).send();
    });
});

app.patch('/expenses/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }
    const body = _.pick(req.body, 'title', 'amount', 'spentAt');

    Expense.findOneAndUpdate({
        _id: id
    }, {
        $set: body
    }, {
        new: true
    }).then((result) => {
        if (!result) {
            return res.status(404).send();
        }

        res.send(result);
    }).catch(() => {
        res.status(400).send();
    })

});

app.listen(3000, () => {
    console.log('Application is running on port 3000');
});

module.exports = {
    app
};