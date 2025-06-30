const express = require("express");
const router = express.Router();
const subAdminController = require("../controllers/subAdminController");
const upload = require('../middleware/uploadMiddleware')

router.post("/create",upload.single("profile"), subAdminController.createSubAdmin);
router.get("/", subAdminController.getAllSubAdmins);
router.put("/update/:id",upload.single("profile"), subAdminController.updateSubAdmin);
router.delete("/delete/:id", subAdminController.deleteSubAdmin);
router.put("/status/:id", subAdminController.updateSubAdminStatus);

module.exports = router;
