const express = require("express");
const router = express.Router();
const AttributeController = require("../controllers/attributeController");
const multer = require ('multer')
const upload = multer()

router.get("/", AttributeController.getAllAttributes);
router.post("/create",upload.none(), AttributeController.createAttribute);
router.put("/update/:id",upload.none(), AttributeController.updateAttribute);
router.delete("/delete/:id", AttributeController.deleteAttribute);


module.exports = router;
