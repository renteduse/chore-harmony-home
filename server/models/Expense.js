
const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: String,
  share: {
    type: Number,
    required: true,
  },
});

const ExpenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Please add expense amount'],
    },
    description: {
      type: String,
      required: [true, 'Please add expense description'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paidBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    paidByName: String,
    participants: [ParticipantSchema],
    householdId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Household',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', ExpenseSchema);
