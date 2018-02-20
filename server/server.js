const express = require('express');

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
app.listen(3000, () => {
    console.log('Application is running on port 3000');
});

module.exports = {
    app
};