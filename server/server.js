require('./config/config');

const express = require('express');
const mongoose = require('./db/mongoose'); // connect to db
const expensesRouter = require('./routes/expenses');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT;

app.use(require('body-parser').json());
app.use('/expenses', expensesRouter);
app.use('/users', usersRouter);

app.listen(PORT, () => {
    console.log(`Application is running on port ${PORT}`);
});
module.exports = {
    app
};