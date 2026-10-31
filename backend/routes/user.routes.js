
const express = require("express");
const router = express.Router();

const {
    getCurrentUser,
    updateProfile
} = require("../controllers/user.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

// Protected route
router.get("/me", protect, getCurrentUser);

// Update User Profile
router.put("/profile", protect, updateProfile);



module.exports = router;
