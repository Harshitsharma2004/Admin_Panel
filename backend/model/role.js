const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    permissions: {
      type: [String], 
      required: true,
      default: [],
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Role', roleSchema);
