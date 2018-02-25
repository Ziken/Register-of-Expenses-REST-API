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
        const user = users[1];
        request(app)
            .post('/expenses')
            .send({
                title: expense.title,
                amount: expense.amount,
                spentAt: expense.spentAt
            })
            .set('x-auth', user.tokens[0].token)
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

                Expense.findOne({title: expense.title, _creator: user._id}).then((result) => {
                    expect(result).to.exist;
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
        const user = users[1];
        request(app)
            .post('/expenses')
            .send({
                title: expense.title,
                amount: expense.amount,
                spentAt: expense.spentAt
            })
            .set('x-auth', user.tokens[0].token)
            .expect(400)
            .end((err) => {
                if (err) {
                    return done(err)
                }
                Expense.find({_creator: user._id}).then((result) => {
                    expect(result.length).to.equal(0);
                    done();
                }).catch(err => done(err));
            });
    });

    it('should not add new expense document if user is not authorized', (done) => {
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
            .set('x-auth', 'invalid_token')
            .expect(401)
            .end(done)
    });
});

describe('GET /expenses', () => {
    it('should get all user\'s expense documents', (done) => {
        const user = users[0];
        request(app)
            .get('/expenses')
            .set('x-auth', user.tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.result.length).to.equal(2);
            })
            .end(done);
    });

    it('should not get all other user\'s expense documents', (done) => {
        const user = users[1];
        request(app)
            .get('/expenses')
            .set('x-auth', user.tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.result).to.empty;
            })
            .end(done);
    });
});

describe('GET /expenses/:id', () => {
    it('should get an expense document with valid id', (done) => {
        const user = users[0];
        request(app)
            .get(`/expenses/${expenses[0]._id}`)
            .set('x-auth', user.tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.result).to.deep.include(expenses[0]);
            })
            .end(done);
    });

    it('should return status 404 if expense document not found', (done) => {
        const user = users[0];
        request(app)
            .get(`/expense/${new ObjectID().toHexString()}`)
            .set('x-auth', user.tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });

    it('should not return expense document of other user', (done) => {
        const user = users[1];
        request(app)
            .get(`/expenses/${expenses[0]._id}`)
            .set('x-auth', user.tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });

    it('should not return an expense document with invalid :id', (done) => {
        const user = users[0];
        request(app)
            .get('/expenses/1234abc')
            .set('x-auth', user.tokens[0].token)
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
        const user = users[0];
        const newTitle = 'New great title';
        request(app)
            .patch(`/expenses/${expense._id}`)
            .send({title: newTitle})
            .set('x-auth', user.tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.result.title).to.equal(newTitle);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                Expense.find({title: newTitle, _creator: user._id}).then((result) => {
                    expect(result.length).to.equal(1);
                    done();
                }).catch(err => done(err));
            });
    });

    it('should return status 404 if expense document not found', (done) => {
        const user = users[0];
        request(app)
            .patch(`/expense/${new ObjectID().toHexString()}`)
            .send({title: 'Great title'})
            .set('x-auth', user.tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });

    it('should not update document of other user', (done) => {
        const user = users[1];
        const newTitle = 'Great title 123';

        request(app)
            .patch(`/expenses/${expenses[0]._id}`)
            .send({title: 'Great title'})
            .set('x-auth', user.tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end((err) => {
                if (err) {
                    return done(err)
                }
                Expense.findOne({title: newTitle}).then((result) => {
                    expect(result).to.be.null;
                    done();
                }).catch(err => done(err));
            });
    });

    it('should not update an expense document with invalid :id', (done) => {
        const user = users[0];
        const newTitle = 'Great title 123';

        request(app)
            .patch('/expenses/1234abc')
            .send({title: newTitle})
            .set('x-auth', user.tokens[0].token)
            .expect(400)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end((err) => {
                if (err) {
                    return done(err)
                }
                Expense.findOne({title: newTitle}).then((result) => {
                    expect(result).to.be.null;
                    done();
                }).catch(err => done(err));
            });
    });
});

describe('DELETE /expenses/:id', () => {
    it('should remove an expense document', (done) => {
        const expense = expenses[0];
        const user = users[0];
        request(app)
            .delete(`/expenses/${expense._id}`)
            .set('x-auth', user.tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.result).to.include(expense);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }
                Expense.findOne({
                    _id: expense._id,
                    _creator: user._id
                }).then((result) => {
                    expect(result).to.be.null;
                    done();
                }).catch(err => done(err));
            });
    });

    it('should return status 404 if expense document not found', (done) => {
        const user = users[1];
        request(app)
            .delete(`/expense/${new ObjectID().toHexString()}`)
            .set('x-auth', user.tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });

    it('should not remove an expense document with invalid :id', (done) => {
        const user = users[1];
        request(app)
            .delete('/expenses/1234abc')
            .set('x-auth', user.tokens[0].token)
            .expect(400)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end(done);
    });

    it('should not remove document of other user', (done) => {
        const user = users[1];
        const expense = expenses[0];
        request(app)
            .delete(`/expenses/${expense._id}`)
            .set('x-auth', user.tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body).to.empty;
            })
            .end((err) => {
                if (err) {
                    return done(err)
                }
                Expense.findById(expense._id).then((result) => {
                    expect(result).to.be.not.null;
                    done();
                }).catch(err => done(err));
            });
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
    it('should log in user', (done) => {
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

    it('should not log in user with invalid password', (done) => {
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