const jwt = require('jsonwebtoken');

const {Expense} = require('./../../models/expense');
const {User} = require('./../../models/user');
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

const userOneID = new ObjectID().toHexString();
const userTwoID = new ObjectID().toHexString();
const users = [
    {
        _id: userOneID,
        email: 'example@example.com',
        password: '123abc',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userOneID, access: 'auth'}, 'verysecrettoken').toString()
        }]
    },
    {
        _id: userTwoID,
        email: 'someone@other.com',
        password: 'abc123',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userTwoID, access: 'auth'}, 'verysecrettoken').toString()
        }]
    }
];

const populateUsers = (done) => {
    User.remove({}).then(() => {

        const addedUsers = [];
        users.forEach((u) => {
            addedUsers.push(new User({
                _id: u._id,
                email: u.email,
                password: u.password,
                tokens: u.tokens
            }).save());
        });
        return Promise.all(addedUsers);
    }).then(() => done()).catch(err => done(err));
};


module.exports = {
    expenses,
    populateExpenses,
    users,
    populateUsers
};