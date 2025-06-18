const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

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


serviceSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("Service", serviceSchema);
