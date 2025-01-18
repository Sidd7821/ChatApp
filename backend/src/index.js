import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { app, server } from "./lib/socket.js";
import path from "path";
dotenv.config();

const port = process.env.PORT || 5001;
const __dirname = path.resolve();
app.use(bodyParser.json({ limit: "50mb" })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    connectDB();
});
