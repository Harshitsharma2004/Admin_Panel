const mongoose = require('mongoose');

const UserTypes = {
  ADMIN: 'Admin',
  SUBADMIN: 'SubAdmin',
  USER: 'User',
};

const userSchema = new mongoose.Schema({
  firstName : { type: String, required: true },
  lastName: { type: String, required: true },
  name: { type: String }, // optional full name
  email: { type: String, required: true, unique: true,lowercase:true },
  type: { type: String, enum: Object.values(UserTypes), default: UserTypes.USER },
  password: { type: String, required: true },
  profile: { type: String,required:false,default:"" }, // image URL
  status: { type: String, default: 'Active' },
  isDeleted:{
    type:Boolean,default:false
  },

  // OTP related
  otp: String,
  otpExpires: Date,
  isVerified: { type: Boolean, default: false },

  // Email update
  pendingEmail: String,
  emailOtp: String,
  emailOtpExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
