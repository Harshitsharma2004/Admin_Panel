const mongoose = require("mongoose");

const subAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profile: { type: String, default: "" },
  password: { type: String, required: true },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  is_active: { type: Boolean, default: true },
  is_deleted: {type:Boolean, default:false}
}, { timestamps: true });

module.exports = mongoose.model("SubAdmin", subAdminSchema);
