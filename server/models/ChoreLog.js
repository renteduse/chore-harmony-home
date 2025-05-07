
const mongoose = require('mongoose');

const ChoreLogSchema = new mongoose.Schema(
  {
    choreId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Chore',
      required: true,
    },
    completedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model('ChoreLog', ChoreLogSchema);
