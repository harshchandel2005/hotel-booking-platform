const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // Admin-specific fields
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Profile fields (optional)
  firstName: String,
  lastName: String,
  avatar: String,
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, {
  // Adds createdAt and updatedAt fields
  timestamps: true
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Passport plugin (keep this as is)
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);