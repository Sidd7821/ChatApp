import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized - NO Token Provided",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized - token is invalid",
            });
        }

        const user = await User.findOne({ _id: decoded.userId }).select(
            "-password"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error authorizing user: ", error.message);
        return res.status(500).json({
            message: error.message,
        });
    }
};
