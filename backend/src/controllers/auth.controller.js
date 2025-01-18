import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    const { email, fullname, password } = req.body;
    try {
        if (!email || !fullname || !password) {
            return res.status(400).json({
                message: "Please enter all fields",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            fullname,
            password: hashedPassword,
        });

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            return res.status(400).json({
                message: "User creation failed",
            });
        }
    } catch (error) {
        console.error("Error creating user: ", error.message);
        return res.status(500).json({
            message: error.message,
        });
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter all fields",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User does not exist",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Error logging in: ", error.message);
        return res.status(500).json({
            message: error.message,
        });
    }
};
export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Error logging out: ", error.message);
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({
                message: "Please upload a profile picture",
            });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updateUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        res.status(200).json(updateUser);
    } catch (error) {
        console.error("Error updating profile: ", error.message);
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Error checking auth: ", error.message);
        return res.status(500).json({
            message: "internal server error",
        });
    }
};
