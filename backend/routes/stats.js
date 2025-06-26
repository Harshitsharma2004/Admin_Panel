const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/statsController");

router.get("/", getDashboardStats);
// router.get("/users-by-date", getUsersByDate);

// router.get("/categories-by-date", getCategoriesByDate);
// router.get("/subcategories-by-date", getSubCategoriesByDate);
// router.get("/services-by-date", getServicesByDate);



module.exports = router;
