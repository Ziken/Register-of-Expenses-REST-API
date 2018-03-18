const express = require('express');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const {authenticate} = require('./../middleware/authenticate');
const {newErr} = require('./../middleware/handleError');
const {Expense} = require('./../models/expense');


const router = express.Router();

router.use(authenticate);

router.post('/', async (req, res, next) => {
    try {
        const {title, amount, spentAt} = req.body;
        const expense = new Expense({title, amount, spentAt, _creator: req.user._id});
        const result = await expense.save();
        res.send({result})
    } catch (err) {
        next(newErr(400, 'unable to save expense'))
    }
});

router.get('/' , async (req, res) => {
    try {
        const id = req.user._id;
        const result = await Expense.find({_creator: id});
        res.send({result})
    } catch (err) {
        next(newErr(400, 'unable to get expenses'));
    }

});

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!ObjectID.isValid(id)) {
            return next(newErr(400, 'invalid id of the expense'));
        }

        const result = await Expense.findOne({
            _id: id,
            _creator: req.user._id
        });

        if (!result) {
            return next(newErr(404, 'the expense not found'));
        }

        res.send({result});
    } catch (err) {
        return next(400, 'unable to get the expense');
    }

});

router.patch('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!ObjectID.isValid(id)) {
            return next(newErr(400, 'invalid id of the expense'));
        }
        const body = _.pick(req.body, 'title', 'amount', 'spentAt');

        const result = await Expense.findOneAndUpdate({
            _id: id,
            _creator: req.user._id
        }, {
            $set: body
        }, {
            new: true
        });
        if (!result) {
            return next(newErr(404, 'the expense not found'));
        }
        res.send({result});

    } catch (err) {
        return next(newErr(400, 'unable to alter the expense'));
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!ObjectID.isValid(id)) {
            return next(newErr(400, 'invalid id of the expense'));
        }
        const result = await Expense.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        });

        if (!result) {
            return next(newErr(404, 'the expense not found'));
        }

        res.send({result});

    } catch (err) {
        next(newErr(400, 'unable to remove expense'));
    }
});

module.exports = router;