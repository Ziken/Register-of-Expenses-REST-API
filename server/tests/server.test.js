const {expect} = require('chai');
const {ObjectID} = require('mongodb');
const request = require('supertest');


const {app} = require('./../server');
const {Expense} = require('./../models/expense');
const {populateExpenses, expenses} = require('./seed/seed');

beforeEach(populateExpenses);

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
                    expect(result.length).to.equal(expenses.length);
                    done();
                }).catch(err => done(err));
            });
    });
});

describe('GET /expenses', () => {
    it('should get all expenses', (done) => {
        request(app)
            .get('/expenses')
            .expect(200)
            .expect((res) => {
                expect(res.body.result.length).to.equal(expenses.length);
            })
            .end(done);
    });
});

describe('GET /expenses/:id', () => {
    it('should get an expense with valid id', (done) => {
        request(app)
            .get(`/expenses/${expenses[0]._id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.result).to.deep.include(expenses[0]);
            })
            .end(done);
    });

    it('should return status 404 if todo not found', (done) => {
        request(app)
            .get(`/expense/${new ObjectID().toHexString()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });

    it('should not return an expense with invalid :id', (done) => {
        request(app)
            .get('/expenses/1234abc')
            .expect(400)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });

});

describe('PATCH /expenses/:id', () => {
    it('should update an expense', (done) => {
        const expense = expenses[0];
        const newTitle = 'New great title';
        request(app)
            .patch(`/expenses/${expense._id}`)
            .send({title: newTitle})
            .expect(200)
            .expect((res) => {
                expect(res.body.result.title).to.equal(newTitle);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                Expense.find({title: newTitle}).then((result) => {
                    expect(result.length).to.equal(1);
                    done();
                }).catch(err => done(err));
            });
    });

    it('should return status 404 if todo not found', (done) => {
        request(app)
            .get(`/expense/${new ObjectID().toHexString()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });

    it('should not update an expense with invalid :id', (done) => {
        request(app)
            .get('/expenses/1234abc')
            .expect(400)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });
});