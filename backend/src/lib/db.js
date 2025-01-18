import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDB connection: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`);
    }
};
