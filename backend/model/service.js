const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sort_order: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "EventCategory", required: true },
    subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" }],
    profile: { type: String },
    min_price: { type: Number, required: true },
    max_price: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
