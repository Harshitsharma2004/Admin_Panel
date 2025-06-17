const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const upload = require("../middleware/uploadMiddleware");

// Create
router.post("/category/create", upload.single("profile"), categoryController.createCategory);

// Read all
router.get("/category", categoryController.getAllCategories);

// Read one
router.get("/category/:id", categoryController.getCategoryById);

// Update
router.put("/category/update/:id", upload.single("profile"), categoryController.updateCategory);

// Delete
router.delete("/category/delete/:id", categoryController.deleteCategory);

module.exports = router;
