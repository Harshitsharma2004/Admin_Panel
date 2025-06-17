const express = require("express");
const router = express.Router();
const subCategoryController = require("../controllers/subCategoryController");
const upload = require("../middleware/uploadMiddleware"); // Multer middleware

router.get("/", subCategoryController.getAllSubCategories);
router.post("/create", upload.single("profile"), subCategoryController.createSubCategory);
router.put("/update/:id", upload.single("profile"), subCategoryController.updateSubCategory);
router.delete("/delete/:id", subCategoryController.deleteSubCategory);

module.exports = router;
