const {expect} = require('chai');
const {ObjectID} = require('mongodb');
const request = require('supertest');


const {app} = require('./../server');
const {Expense} = require('./../models/expense');
const {User} = require('./../models/user');
const {populateExpenses, expenses, populateUsers, users} = require('./seed/seed');

beforeEach(populateExpenses);
beforeEach(populateUsers);

describe('POST /expenses', () => {
    it('should add new expense document', (done) => {
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

    it('should not add new expense document with invalid data', (done) => {
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
    it('should get all expense documents', (done) => {
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
    it('should get an expense document with valid id', (done) => {
        request(app)
            .get(`/expenses/${expenses[0]._id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.result).to.deep.include(expenses[0]);
            })
            .end(done);
    });

    it('should return status 404 if expense document not found', (done) => {
        request(app)
            .get(`/expense/${new ObjectID().toHexString()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });

    it('should not return an expense document with invalid :id', (done) => {
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
    it('should update an expense document', (done) => {
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

    it('should return status 404 if expense document not found', (done) => {
        request(app)
            .get(`/expense/${new ObjectID().toHexString()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });

    it('should not update an expense document with invalid :id', (done) => {
        request(app)
            .get('/expenses/1234abc')
            .expect(400)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });
});

describe('DELETE /expenses/:id', () => {
    it('should remove an expense document', (done) => {
        const expense = expenses[0];

        request(app)
            .delete(`/expenses/${expense._id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.result).to.include(expense);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }
                Expense.findById(expense._id).then((result) => {
                    expect(result).to.be.null;
                    done();
                }).catch(err => done(err));
            });
    });

    it('should return status 404 if expense document not found', (done) => {
        request(app)
            .get(`/expense/${new ObjectID().toHexString()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });

    it('should not remove an expense document with invalid :id', (done) => {
        request(app)
            .get('/expenses/1234abc')
            .expect(400)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should add user', (done) => {
        const user = {
            email: 'testemail@test.com',
            password: '123qwe'
        };

        request(app)
            .post('/users')
            .send({email: user.email, password: user.password})
            .expect(200)
            .expect((res) => {
                expect(res.body.result.email).to.equal(user.email);
                expect(res.get("x-auth")).to.exist;

            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.find({email: user.email, 'tokens.token': res.get('x-auth')}).then((result) => {
                    expect(result.length).to.equal(1);
                    expect(result.password).to.not.equal(user.password); // hashed password
                    done();
                }).catch(err => done(err));
            });
    });

    it('should not add user with invalid data', (done) => {
        const user = {
            email: 'testemail.com',
            password: '12we'
        };

        request(app)
            .post('/users')
            .send({email: user.email, password: user.password})
            .expect(400)
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.find({email: user.email}).then((result) => {
                    expect(result).to.be.empty;
                    done();
                }).catch(err => done(err));
            });
    });

    it('should not add user with existing email', (done) => {
        const user = users[0];

        request(app)
            .post('/users')
            .send({email: user.email, password: user.password})
            .expect(400)
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.find({email: user.email}).then((result) => {
                    expect(result.length).to.equal(1);
                    done();
                }).catch(err => done(err));
            });
    });
});

describe('GET /users/me', () => {
    it('should authenticate user', (done) => {
        const user = users[0];
        request(app)
            .get('/users/me')
            .set('x-auth', user.tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.result._id).to.equal(user._id);
                expect(res.body.result.email).to.equal(user.email);
            })
            .end(done);
    });

    it('should not authenticate user with invalid token', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', 'invalid_toke')
            .expect(401)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return x-auth', (done) => {
        const user = users[0];
        request(app)
            .post('/users/login')
            .send({
                email: user.email,
                password: user.password
            })
            .expect(200)
            .expect((res) => {
                expect(res.get('x-auth')).to.exist;
                expect(res.body.result._id).to.equal(user._id);
                expect(res.body.result.email).to.equal(user.email);
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                User.findByToken(res.get('token')).then((u) => {
                    expect(u._id).to.equal(user._id);
                }).catch(err => done(err))
            });
    });

    it('should not login user with invalid password', (done) => {
        const user = users[0];
        request(app)
            .post('/users/login')
            .send({
                email: user.email,
                password: user.password+'invalid'
            })
            .expect(401)
            .end(done);
    });

    it('should not log in user with invalid credentials', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: 'some@invalid.email',
                password: 'invaidPassword'
            })
            .expect(401)
            .end(done);
    });
});


describe('POST /users/logout', () => {
    it('should log out user', (done) => {
        const user = users[0];
        const token = users[0].tokens[0].token;
        request(app)
            .post('/users/logout')
            .set('x-auth', token)
            .expect(200)
            .end((err) => {
                if (err) {
                    return done(err)
                }

                User.findOne({_id: user._id, 'tokens.token': token}).then((result) => {
                    expect(result).to.be.null;
                    done();
                }).catch(err => done(err));
            });
    });

    it('should not log out user with invalid token', (done) => {
        const user = users[0];
        const token = '123abc';
        request(app)
            .post('/users/logout')
            .set('x-auth', token)
            .expect(401)
            .end(done);
    });
});