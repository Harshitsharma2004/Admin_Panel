const User = require('../model/user');
const SubAdmin = require('../model/sub_admin');
const sendOtpEmail = require('../utils/sendOtp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Password validation function: min 8 chars, uppercase, lowercase, digit, special char
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[\W_]/.test(password);

  return (
    typeof password === 'string' &&
    password.length >= minLength &&
    hasUpper &&
    hasLower &&
    hasDigit &&
    hasSpecial
  );
};

// Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();


// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'User not found', status: false });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP.', status: false });
    }

    // Validate password before saving
    if (!validatePassword(password)) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters and include uppercase, lowercase, digit, and special character.', status: false
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Verified successfully.', token, status: true });
  } catch (err) {
    console.error('Error during OTP verification:', err);
    res.status(500).json({ error: 'OTP verification failed. Please try again.', status: false });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({ error: 'Account not found or not verified.', status: false });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOtpEmail(email, otp);
    res.status(200).json({ message: 'OTP sent for password reset.', status: true });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ error: 'Failed to send OTP for reset.', status: false });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP.', status: false });
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error:
          'New password must be at least 8 characters and include uppercase, lowercase, digit, and special character.', status: false
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.', status: true });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ error: 'Could not reset password.', status: false });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await SubAdmin.findOne({ email });
      fromCollection = "subadmins";
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.', status: false });
    }

    const userType =
      typeof user.type === "string"
        ? user.type.toLowerCase()
        : typeof user.role === "string"
          ? user.role.toLowerCase()
          : typeof user.role?.name === "string"
            ? user.role.name.toLowerCase()
            : "";


    if (userType !== 'admin' && userType !== 'subadmin') {
      return res.status(403).json({ error: 'Access denied. Admins only.', status: false });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password', status: false });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.type },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name, // optional
        isVerified: user.isVerified,
        role: user.type,
      },
      status: true
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Login failed', status: false });
  }
};



// GET /user
exports.getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("role") // populate role if SubAdmin
      .select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found", status: false });
    }

    const isSubAdmin = user.type === "SubAdmin";

    return res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name || `${user.firstName} ${user.lastName}` || "Admin",
      role: isSubAdmin ? user.role?.roleName || "SubAdmin" : user.type,
      permissions: isSubAdmin ? user.role?.permissions || [] : [], // ✅ SubAdmin permissions only
      isVerified: user.isVerified,
    });
  } catch (err) {
    console.error("Error in getUserData:", err);
    return res.status(500).json({ error: "Server error", status: false });
  }
};




//update user 
exports.updateUserProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found", status: false });

    // Update name
    if (name) user.name = name;

    // Handle email change with OTP
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.isVerified) {
        return res.status(400).json({ error: "Email already in use by another account", status: false });
      }

      const otp = generateOtp();
      user.pendingEmail = email;
      user.emailOtp = otp;
      user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      await sendOtpEmail(email, otp);
      await user.save();

      return res.status(200).json({
        message: "OTP sent to new email for verification.",
        emailChangePending: true, status: true
      });
    }

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user: { name: user.name, email: user.email }, status: true });
  } catch (err) {
    console.error("Profile update failed:", err);
    res.status(500).json({ error: "Server error", status: false });
  }
};

//verify email OTP
// /controllers/userController.js
exports.verifyEmailChangeOtp = async (req, res) => {
  const { otp } = req.body;

  try {
    const user = await User.findById(req.userId);

    if (!user || !user.pendingEmail) {
      return res.status(400).json({ error: "No pending email change request.", status: false });
    }

    if (
      user.emailOtp !== otp ||
      !user.emailOtpExpires ||
      user.emailOtpExpires < new Date()
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP.", status: false });
    }

    // OTP is valid → Update the email
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Email updated successfully.", email: user.email, status: true });
  } catch (err) {
    console.error("Email change OTP verification failed:", err);
    res.status(500).json({ error: "Server error during OTP verification.", status: false });
  }
};

//Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found", status: false });

    // Compare current password with hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password", status: false });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: "Password updated successfully", status: true });
  } catch (err) {
    console.error("Password change failed:", err);
    res.status(500).json({ error: "Server error", status: false });
  }
};


// Add new users with file upload
exports.adminAddUser = async (req, res) => {
  const { firstName, lastName, email, password, role = 'User', status = 'Active' } = req.body;

  try {
    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists", status: false });
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters and include uppercase, lowercase, digit, and special character.",
        status: false
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get profile image (file path or buffer, depending on how you store)
    const profilePath = req.file ? req.file.path : null; // or req.file.buffer if storing in DB directly

    const newUser = new User({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      profile: req.file ? req.file.path : undefined, // Store the path only
      type: role,
      status,
      isVerified: true
    });

    await newUser.save();

    res.status(201).json({ message: "User added successfully", user: newUser, status: true });
  } catch (err) {
    console.error("Admin Add User Error:", err);
    res.status(500).json({ error: "Server error", status: false });
  }
};




//get all users
exports.getAllUsers = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    status,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
    sortField = "createdAt",
    sortOrder = "desc",
    query,
  } = req.query;

  try {
    // --- Build Filter ---
    const andConditions = [
      { isDeleted: false },
      { type: "User" }, // 🚫 Only Users
    ];

    // Text search
    if (query) {
      const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapeRegex(query), "i");
      andConditions.push({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { email: regex },
        ],
      });
    }

    // Status filter
    // Status filter (based on 'status' field in DB)
    if (status) {
      const normalizedStatus = status.trim().toLowerCase();
      if (["active", "inactive"].includes(normalizedStatus)) {
        andConditions.push({
          status: new RegExp(`^${normalizedStatus}$`, "i"), // case-insensitive match
        });
      }
    }



    // Date filter
    if (dateFrom || dateTo) {
      const createdAtFilter = {};
      if (dateFrom) createdAtFilter.$gte = new Date(dateFrom);
      if (dateTo) createdAtFilter.$lte = new Date(dateTo);
      andConditions.push({ createdAt: createdAtFilter });
    }

    const filter = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    // --- Sorting ---
    const allowedSortFields = ["firstName", "lastName", "email", "createdAt", "type"];
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : "createdAt";
    const sortOptions = { [safeSortField]: sortOrder === "asc" ? 1 : -1 };

    // --- Pagination ---
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // --- Query ---
    const total = await User.countDocuments(filter);
    const sortFieldMap = {
      firstName: "$firstName",
      lastName: "$lastName",
      email: "$email",
      createdAt: "$createdAt",
      type: "$type",
    };

    const aggregationPipeline = [
      { $match: filter },
      {
        $addFields: {
          sortFieldLower: sortField === "createdAt"
            ? sortFieldMap[sortField]
            : { $toLower: sortFieldMap[sortField] },
        },
      },
      { $sort: { sortFieldLower: sortOrder === "asc" ? 1 : -1 } },
      { $skip: skip },
      { $limit: limitNumber },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          type: 1,
          status: 1,
          profile: 1,
          createdAt: 1,
        },
      },
    ];

    const users = await User.aggregate(aggregationPipeline);


    // --- Map Users ---
    const mappedUsers = users.map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.type,
      // status: user.status?.toLowerCase() === "inactive" ? "Inactive" : "Active",
      status: user.status,
      profile: user.profile || "",
      createdAt: user.createdAt?.toISOString() || "",
    }));

    // --- Response ---
    res.status(200).json({
      users: mappedUsers,
      total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      message: "Users fetched successfully",
      status: true,
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Server error", status: false });
  }
};






//edit user
exports.editUserByAdmin = async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const userId = req.params.id;

  


  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found", status: false });
    }

    const normalizedEmail = email?.toLowerCase();

    if (normalizedEmail && normalizedEmail !== user.email) {
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: mongoose.Types.ObjectId(userId) },
      });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use", status: false });
      }

      user.email = normalizedEmail;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    if (req.file) {
      user.profile = req.file.path.replace(/\\/g, "/");
    }

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user,
      status: true,
    });
  } catch (err) {
    console.error("Admin edit failed:", err);
    return res.status(500).json({ error: "Server error", status: false });
  }
};

//Delete User
exports.softDeleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted (soft)", user: updatedUser });
  } catch (error) {
    console.error("Soft delete failed:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//Active Inactive user

// controllers/userController.js or wherever your controller lives
exports.toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "Active" ? "Inactive" : "Active";
    await user.save();

    const updatedUser = await User.findById(userId); // to ensure the latest data

    res.json({
      message: `User status updated to ${updatedUser.status}`,
      user: updatedUser, // ✅ Return updated user object
    });
  } catch (err) {
    console.error("Status toggle error:", err);
    res.status(500).json({ message: "Error updating user status" });
  }
};


