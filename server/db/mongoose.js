const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/ExpensesRegister').catch((err) => {
    console.log(err);
    process.exit(1);
});

module.exports = {
    mongoose
};