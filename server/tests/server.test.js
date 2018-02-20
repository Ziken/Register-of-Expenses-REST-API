const {expect} = require('chai');
const request = require('supertest');


const {app} = require('./../server');
const {Expense} = require('./../models/expense');
const {removeExpenses} = require('./seed/seed');

beforeEach(removeExpenses);

describe('POST /expenses', () => {
    it('should add new expense', (done) => {
        const expense = {
            title: 'Some title here',
            amount: 12.34,
            spentAt: new Date().getTime()
        };
        request(app)
            .post('/expenses')
            .send({
                title: expense.title,
                amount: expense.amount,
                spentAt: expense.spentAt
            })
            .expect(200)
            .expect((res) => {
                Object.keys(expense).forEach((key) => {
                    expect(res.body.result[key]).to.equal(expense[key]);
                });
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Expense.find({title: expense.title}).then((result) => {
                    expect(result.length).to.equal(1);
                    done();
                }).catch(err => done(err));
            });
    });

    it('should not add new expense with invalid data', (done) => {
        const expense = {
            title: '    a    ',
            amount: 12.34,
            spentAt: new Date().getTime()
        };
        request(app)
            .post('/expenses')
            .send({
                title: expense.title,
                amount: expense.amount,
                spentAt: expense.spentAt
            })
            .expect(400)
            .end((err) => {
                if (err) {
                    return done(err)
                }
                Expense.find().then((result) => {
                    expect(result.length).to.equal(0);
                    done();
                }).catch(err => done(err));
            });
    });
});