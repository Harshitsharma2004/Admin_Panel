const express = require("express");
const router = express.Router();
const subAdminController = require("../controllers/subAdminController");

router.post("/create", subAdminController.createSubAdmin);
router.get("/", subAdminController.getAllSubAdmins);
router.put("/update/:id", subAdminController.updateSubAdmin);
router.delete("/delete/:id", subAdminController.deleteSubAdmin);
router.put("/status/:id", subAdminController.updateSubAdminStatus);

module.exports = router;
