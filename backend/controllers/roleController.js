const Role = require("../model/role");


exports.createRole = async (req, res) => {
  const { roleName, permissions } = req.body;

  try {
    if (!roleName || !Array.isArray(permissions)) {
      return res.status(400).json({ message: "Invalid role data", status: false });
    }

    const existing = await Role.findOne({ roleName });
    if (existing) {
      return res.status(400).json({ message: "Role already exists", status: false });
    }

    const role = new Role({ roleName, permissions });
    await role.save();

    res.status(201).json({ message: "Role created successfully", data: role, status: true });
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ message: "Server error", status: false });
  }
};



exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.status(200).json({ data: roles, status: true });
  } catch (error) {
    res.status(500).json({ message: "Error fetching roles", status: false });
  }
};


exports.updateRole = async (req, res) => {
  const { roleName, permissions } = req.body;

  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { roleName, permissions },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: "Role not found", status: false });
    }

    res.status(200).json({ message: "Role updated", data: role, status: true });
  } catch (error) {
    res.status(500).json({ message: "Error updating role", status: false });
  }
};



exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found", status: false });
    }

    res.status(200).json({ message: "Role deleted", status: true });
  } catch (error) {
    res.status(500).json({ message: "Error deleting role", status: false });
  }
};
