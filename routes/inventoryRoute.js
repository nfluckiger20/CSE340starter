// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Assignment 3 inventory route
router.get("/detail/:InventoryId", invController.buildByInventoryId);

module.exports = router;