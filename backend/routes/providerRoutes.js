const express = require("express");
const router = express.Router();
const Provider = require("../controllers/providerController");
const upload = require("../middleware/uploadMiddleware");

router.get("/", Provider.getAllProviders);
router.post("/create", upload.single("profile"), Provider.addProvider);
router.put("/update/:id", upload.single("profile"), Provider.editProvider);
router.delete("/delete/:id", Provider.deleteProvider);

module.exports = router;
