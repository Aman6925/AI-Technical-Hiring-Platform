const User = require("../models/user.model");   
const getCurrentUser = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "User authenticated successfully!",
            user: req.user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                name: name.trim()
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


module.exports = {
    getCurrentUser,
    updateProfile
};
