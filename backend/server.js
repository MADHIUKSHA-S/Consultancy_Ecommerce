import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRoute from './routes/cartRoute.js';
import order from "./routes/order.js";
// INFO: Create express app
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// INFO: Middleware
app.use(express.json());
app.use(cors());


// INFO: API endpoints
app.use("/api/order", order);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use('/api/cart', cartRoute);
// INFO: Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// INFO: Start server
app.listen(5000, () =>
  console.log(`Server is running on at http://localhost:${5000}`)
);
