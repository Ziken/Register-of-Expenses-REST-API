const mongoose = require('mongoose');

mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost:27017/ExpensesRegister').catch((err) => {
    console.log(err);
    process.exit(1);
});

module.exports = {
    mongoose
};