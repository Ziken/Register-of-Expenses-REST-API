const express = require('express');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const {authenticate} = require('./../middleware/authenticate');
const {Expense} = require('./../models/expense');

const router = express.Router();

router.use(authenticate);

router.post('/', (req, res) => {
    const {title, amount, spentAt} = req.body;
    const expense = new Expense({title, amount, spentAt, _creator: req.user._id});

    expense.save().then((result) => {
        res.send({result});
    }).catch((err) => {
        res.status(400).send('unable to save expense');
    });
});

router.get('/' ,(req, res) => {
    const id = req.user._id;
    Expense.find({_creator: id}).then((result) => {
        res.send({result});
    }).catch((err) => {
        res.status(400).send('unable to get expenses');
    });
});

router.get('/:id', (req,res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send('invalid id of the expense');
    }

    Expense.findOne({
        _id: id,
        _creator: req.user._id
    }).then((result) => {
        if (!result) {
            return res.status(404).send('the expense not found');
        }
        res.send({result});
    }).catch(() => {
        res.status(404).send('the expense not found');
    });
});

router.patch('/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send('invalid id of the expense');
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
            return res.status(404).send('the expense not found');
        }

        res.send({result});
    }).catch(() => {
        res.status(400).send('unable to alter the expense');
    });
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send('invalid the id of the expense');
    }

    Expense.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((result) => {
        if (!result) {
            return res.status(404).send('the expense not found');
        }

        res.send({result});
    }).catch(() => {
        res.status(400).send('unable to remove expense');
    });
});

module.exports = router;