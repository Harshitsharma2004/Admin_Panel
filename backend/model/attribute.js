const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sort_order: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventCategory',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    is_required: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['radio','button','checkbox','number','calendar','color','boolean','textbox'],
      required: true,
    },
    attribute_name: {
      type: [String],
      required:true,
    }
  },
  {
    timestamps: true,
  }
);

// Ensure sort_order is unique per service
attributeSchema.index({ service: 1, sort_order: 1 }, { unique: true });

module.exports = mongoose.model('Attribute', attributeSchema);
