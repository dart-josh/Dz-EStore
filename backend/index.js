import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.route.js";
import cartRoute from "./routes/cart.route.js";
import managerRoute from "./routes/manager.route.js";
import productRoute from "./routes/product.route.js";
import storeRoute from "./routes/store.route.js";
import userRoute from "./routes/user.route.js";
import { connectDB } from "./lib/connectDB.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute)
app.use("/api/cart", cartRoute)
app.use("/api/manager", managerRoute)
app.use("/api/product", productRoute)
app.use("/api/store", storeRoute)
app.use("/api/user", userRoute)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB()
}) 