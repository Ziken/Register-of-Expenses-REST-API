const {Expense} = require('./../../models/expense');
const {ObjectID} = require('mongodb');
const expenses = [
    {
        _id: new ObjectID().toHexString(),
        title: 'Food',
        amount: 10.99,
        spentAt: new Date().getTime()
    },
    {
        _id: new ObjectID().toHexString(),
        title: 'new TV',
        amount: 1000,
        spentAt: new Date(123123123).getTime()
    }
];


const populateExpenses = (done) => {
    Expense.remove({})
        .then((result) => {
            const a = new Expense({
                _id: expenses[0]._id,
                title: expenses[0].title,
                amount: expenses[0].amount,
                spentAt: expenses[0].spentAt
            });
            const b = new Expense({
                _id: expenses[1]._id,
                title: expenses[1].title,
                amount: expenses[1].amount,
                spentAt: expenses[1].spentAt
            });

            return Promise.all([a.save(),b.save()]);
        })
        .then(() => done())
        .catch(err => done(err));
};

module.exports = {
    expenses,
    populateExpenses
};