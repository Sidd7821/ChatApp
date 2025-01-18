import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUserForSidebar = async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        const filteredUser = await User.find({
            _id: { $ne: loggedInUser },
        }).select("-password");

        res.status(200).json(filteredUser);
    } catch (error) {
        console.error("Error in getUserForSidebar: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newmessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });
        await newmessage.save();

        //

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newmessage);
        }

        res.status(201).json(newmessage);
    } catch (error) {
        console.error("Error in sendMessage: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
