const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/ServiceController");
const upload = require("../middleware/uploadMiddleware");

router.get("/", serviceController.getAllServices);
router.post("/create", upload.single("profile"), serviceController.createService);
router.put("/update/:id", upload.single("profile"), serviceController.updateService);
router.delete("/delete/:id", serviceController.deleteService);

module.exports = router;
