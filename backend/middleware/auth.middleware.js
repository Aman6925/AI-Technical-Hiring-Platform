
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Authentication Middleware
const protect = async (req, res, next) => {
    try {
        // Get token from request headers
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find user without password
        const user = await User.findById(decoded.id)
            .select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Attach user to request
        req.user = user;

        // Continue to next middleware/controller
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, invalid or expired token"
        });
    }
};


const authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not authorized."
            });
        }

        next();
    };
};


module.exports = { protect, authorizeRoles };
