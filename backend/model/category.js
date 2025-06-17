const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  profile: {
    type: String,
    default: "",
  },
  sort_order: {
    type: Number,
    required: true,
    unique: true, //prevent duplicate values
    min:1, //prevent negative values
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EventCategory', categorySchema);
