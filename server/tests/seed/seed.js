const {Expense} = require('./../../models/expense');

const expenses = [
    {
        title: 'Food',
        amount: 10.99,
        spentAt: new Date().getTime()
    },
    {
        title: 'new TV',
        amount: 1000,
        spentAt: new Date(123123123).getTime()
    }
];


const populateExpenses = (done) => {
    Expense.remove({})
        .then((result) => {
            const a = new Expense({
                title: expenses[0].title,
                amount: expenses[0].amount,
                spentAt: expenses[0].spentAt
            });
            const b = new Expense({
                title: expenses[0].title,
                amount: expenses[0].amount,
                spentAt: expenses[0].spentAt
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