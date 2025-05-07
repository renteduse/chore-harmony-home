
const mongoose = require('mongoose');
const crypto = require('crypto');

const HouseholdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a household name'],
    },
    inviteCode: {
      type: String,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate random invite code before saving
HouseholdSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next();
  }

  // Generate random 8-character invite code
  this.inviteCode = crypto.randomBytes(4).toString('hex');
  next();
});

// Reverse populate with virtuals
HouseholdSchema.virtual('members', {
  ref: 'User',
  localField: '_id',
  foreignField: 'household',
  justOne: false,
});

module.exports = mongoose.model('Household', HouseholdSchema);
