const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 2,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01,
        set: v => v.toFixed(2)
    },
    spentAt: {
        type: Date,
        required: true
    },
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = {
    Expense
};