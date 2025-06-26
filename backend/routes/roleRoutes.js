const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");

router.post("/create", roleController.createRole);
router.get("/", roleController.getRoles);
router.put("/update/:id", roleController.updateRole);
router.delete("/delete/:id", roleController.deleteRole);

module.exports = router;
