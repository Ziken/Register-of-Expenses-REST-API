const {Expense} = require('./../../models/expense');

const removeExpenses = (done) => {
    Expense.remove({})
        .then((result) => done())
        .catch(err => done(err));
};

module.exports = {
    removeExpenses
};