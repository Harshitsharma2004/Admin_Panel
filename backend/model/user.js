const mongoose = require('mongoose');

const UserTypes = {
  ADMIN: 'Admin',
  SUBADMIN: 'SubAdmin',
  USER: 'User',
  PROVIDER: 'Provider',
};

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String }, // optional full name
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    profile: { type: String, default: "" }, // image URL

    // Role type (Admin, SubAdmin, etc.)
    type: {
      type: String,
      enum: Object.values(UserTypes),
      required: true,
    },

    // Role reference for SubAdmins
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: function () {
        return this.type === "SubAdmin";
      },
    },

    // Status flags
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    status: { type: String, default: 'Active' },

    // OTP/verification
    otp: String,
    otpExpires: Date,

    // Email update flow
    pendingEmail: String,
    emailOtp: String,
    emailOtpExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
