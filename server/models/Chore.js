
const mongoose = require('mongoose');

const ChoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a chore name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      required: [true, 'Please specify chore frequency'],
    },
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please specify who is assigned to this chore'],
    },
    householdId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Household',
      required: true,
    },
    nextDueDate: {
      type: Date,
      required: [true, 'Please specify when this chore is next due'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Chore', ChoreSchema);
